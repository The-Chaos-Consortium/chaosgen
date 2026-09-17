import { describe, expect, it } from "vitest";

import { customizeCharacter, generateCharacter } from "../../src/core/generation.ts";
import { createSeededRandom, type RandomSource } from "../../src/core/rng.ts";
import { rules } from "../../src/core/rules.ts";

const minimumRandom: RandomSource = { next: () => 0 };

function generate(seed: string, backgroundId?: string) {
  return generateCharacter({
    seed,
    random: createSeededRandom(seed),
    ...(backgroundId === undefined ? {} : { backgroundId }),
  });
}

describe("character generation", () => {
  it("is reproducible, records rolls, and evaluates no random values during rendering", () => {
    const first = generate("synthetic reproducibility", "bounty-hunter");
    const second = generate("synthetic reproducibility", "bounty-hunter");

    expect(first).toEqual(second);
    expect(first.generation.originalRolls.attributes.strength.dice).toHaveLength(3);
    expect(first.generation.originalRolls.additional.map(({ id }) => id)).toEqual(expect.arrayContaining([
      "identity.age",
      "stamina",
      "wealth",
      "character.item.7.quantity",
    ]));
    expect(first.actor.kind).toBe("character");
    if (first.actor.kind !== "character") throw new Error("expected a character");
    expect(first.actor.currency).toEqual({ amount: expect.any(Number), unit: "silver-pennies" });
    expect(first.actor.inventory.every(({ ownerActorId }) => ownerActorId === first.actor.id)).toBe(true);
  });

  it("generates every background with independent inventory instances", () => {
    rules.backgrounds.forEach((background) => {
      const document = generate(`all-backgrounds/${background.id}`, background.id);
      expect(document.actor.kind).toBe("character");
      if (document.actor.kind !== "character") return;
      expect(document.actor.background).toEqual({ id: background.id, name: background.name });
      expect(new Set(document.actor.inventory.map(({ instanceId }) => instanceId)).size).toBe(
        document.actor.inventory.length,
      );
    });
  });

  it("uses recorded d20 indexes rather than trait-table array positions", () => {
    const shuffled = { ...rules, traitTables: { ...rules.traitTables, physique: [...rules.traitTables.physique].reverse() } };
    const generated = generateCharacter({ seed: "shuffled traits", random: minimumRandom, backgroundId: "duelist", rules: shuffled });
    if (generated.actor.kind !== "character") throw new Error("expected a character");

    expect(generated.actor.traits.physique).toBe(rules.traitTables.physique.find(({ d20Index }) => d20Index === 1)?.value);
  });

  it("preserves gear beyond capacity and computes armor eligibility", () => {
    const roadwarden = generateCharacter({ seed: "minimum roadwarden", random: minimumRandom, backgroundId: "roadwarden" });
    const knight = generateCharacter({ seed: "minimum knight", random: minimumRandom, backgroundId: "knight" });
    if (roadwarden.actor.kind !== "character" || knight.actor.kind !== "character") throw new Error("expected characters");

    expect(roadwarden.actor.attributes.strength.current).toBe(3);
    expect(roadwarden.actor.inventoryCapacity).toBe(10);
    expect(roadwarden.actor.inventory.flatMap(({ occupiedSlots }) => occupiedSlots)).toContain(11);
    expect(knight.actor.inventory.find(({ definitionId }) => definitionId === "heavy-plate-armor")?.armor).toEqual({
      armorValue: 3,
      canWear: true,
    });
  });

  it("creates rule-complete companions without moving starting gear to mounts", () => {
    const knight = generate("synthetic knight", "knight");
    const witch = generate("synthetic witch", "witch");
    const roadwarden = generate("synthetic roadwarden", "roadwarden");
    if (knight.actor.kind !== "character" || witch.actor.kind !== "character" || roadwarden.actor.kind !== "character") throw new Error("expected characters");

    const squire = knight.actor.companions.find(({ definitionId }) => definitionId === "squire");
    expect(squire?.kind).toBe("retainer");
    if (squire?.kind === "retainer") {
      expect(squire.talents).toHaveLength(3);
      expect(new Set(squire.talents.map(({ definitionId }) => definitionId)).size).toBe(3);
      expect(squire.inventory.map(({ definitionId }) => definitionId)).toEqual(["spear"]);
      expect(squire.inventoryCapacity).toBe(10);
      const nameChoices = knight.generation.choices.filter(({ id }) => id.startsWith(`${squire.id}.name.`));
      expect(nameChoices.map(({ id }) => id)).toEqual([
        `${squire.id}.name.given-name`,
        `${squire.id}.name.family-name`,
      ]);
      expect(squire.name).toBe(`${nameChoices[0]?.value} ${nameChoices[1]?.value}`);
    }
    expect(witch.actor.companions.find(({ definitionId }) => definitionId === "familiar")).toMatchObject({
      kind: "pet",
      petKind: "familiar",
      morale: 7,
    });
    expect(roadwarden.actor.companions.find(({ definitionId }) => definitionId === "riding-horse")).toMatchObject({
      kind: "mount",
      capacity: { ridden: 10, unridden: 20 },
      inventory: [],
    });
  });

  it("consumes configurable creation, spell, and loyalty rules", () => {
    const configured = {
      ...rules,
      characterCreation: { ...rules.characterCreation, attributeRoll: { kind: "dice" as const, count: 1, sides: 4 }, inventoryMinimum: 12, corruptionMaximumModifier: 5 },
      spellBooks: rules.spellBooks.map((book, index) => index === 0 ? { ...book, startingSpellCount: 2 } : book),
      retainerLoyalty: { ...rules.retainerLoyalty, bands: [{ minimumWillpower: 3, maximumWillpower: 18, loyalty: 11, retainerMaximum: 8 }] },
    };
    const middleRandom: RandomSource = { next: () => 0.5 };
    const generated = generateCharacter({ seed: "configured rules", random: middleRandom, backgroundId: "knight", rules: configured });
    const witch = generateCharacter({ seed: "configured spells", random: middleRandom, backgroundId: "witch", rules: configured });
    if (generated.actor.kind !== "character" || witch.actor.kind !== "character") throw new Error("expected characters");

    expect(Object.values(generated.generation.originalRolls.attributes).every(({ dice, total }) => dice.length === 1 && total === 3)).toBe(true);
    expect(generated.actor.inventoryCapacity).toBe(12);
    expect(generated.actor.corruption.maximum).toBe(8);
    expect(generated.actor.companions.find(({ kind }) => kind === "retainer")).toMatchObject({ loyalty: { score: 11, retainerMaximum: 8 } });
    expect(witch.actor.spellBooks[0]?.spells).toHaveLength(2);
  });
});

describe("character customization", () => {
  it("rebuilds swaps and retainer loyalty from original rolls without mutation or rerolls", () => {
    const document = generate("customization", "knight");
    if (document.actor.kind !== "character") throw new Error("expected a character");
    const before = structuredClone(document);
    const customized = customizeCharacter(document, {
      name: "Synthetic Knight",
      age: 30,
      traits: { virtue: "Patient" },
      attributeSwap: { first: "strength", second: "willpower" },
    });
    if (customized.actor.kind !== "character") throw new Error("expected a character");

    expect(document).toEqual(before);
    expect(customized.actor.name).toBe("Synthetic Knight");
    expect(customized.actor.attributes.strength.current).toBe(before.generation.originalRolls.attributes.willpower.total);
    expect(customized.actor.corruption.maximum).toBe(before.generation.originalRolls.attributes.strength.total + 3);
    expect(customized.generation.originalRolls).toEqual(before.generation.originalRolls);
    expect(customized.generation.attributeSwap).toEqual({ first: "strength", second: "willpower" });
    const squire = customized.actor.companions.find(({ kind }) => kind === "retainer");
    expect(squire?.kind).toBe("retainer");
    if (squire?.kind === "retainer") expect(squire.loyalty.score).toBeGreaterThanOrEqual(4);
  });

  it("accepts example and custom starting spell choices without unrelated changes", () => {
    const document = generate("spell customization", "witch");
    if (document.actor.kind !== "character") throw new Error("expected a character");
    const book = document.actor.spellBooks[0]!;
    const example = customizeCharacter(document, { startingSpells: { [book.instanceId]: "fireball" } });
    const custom = customizeCharacter(document, { startingSpells: { [book.instanceId]: { customWording: "Call a rain of ash" } } });
    if (example.actor.kind !== "character" || custom.actor.kind !== "character") throw new Error("expected characters");

    expect(example.actor.spellBooks[0]?.spells).toEqual([{ definitionId: "fireball", name: "Fireball" }]);
    expect(custom.actor.spellBooks[0]?.spells).toEqual([{ name: "Custom spell", wording: "Call a rain of ash" }]);
    expect(() => customizeCharacter(document, { startingSpells: { [book.instanceId]: "missing-spell" } })).toThrow("not available");
  });
});
