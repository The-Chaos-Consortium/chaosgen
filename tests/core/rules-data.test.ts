import { describe, expect, it } from "vitest";

import namesData from "../../data/names-v1.json";
import provenance from "../../data/provenance-v1.json";
import rawRules from "../../data/rules-v1.json";
import { names, rules, squireTalentIds } from "../../src/core/rules.ts";
import { validateNameDocument, validateRulesDocument } from "../../src/core/rules-validation.ts";

function background(id: string) {
  const result = rules.backgrounds.find((entry) => entry.id === id);
  if (!result) throw new Error(`Missing background ${id}`);
  return result;
}

function grantedItemIds(id: string): readonly string[] {
  return background(id).equipmentGrants.flatMap(({ grants }) => grants.map(({ itemId }) => itemId));
}

const auditedTalentTriplets = [
  ["survival", "intimidation", "animals"],
  ["survival", "herbalism", "stealth"],
  ["survival", "dirty-fighting", "rumors"],
  ["survival", "performance", "traps"],
  ["armor-master", "tactics", "endurance"],
  ["armor-master", "influence", "brute-strength"],
  ["armor-master", "honor", "acrobatics"],
  ["armor-master", "monster-lore", "history"],
  ["religion", "spirits", "divine-wards"],
  ["religion", "armor-master", "healing"],
  ["religion", "brewing", "scribing"],
  ["religion", "silver-tongue", "forgery"],
  ["arcane", "research", "scribing"],
  ["arcane", "rituals", "bargaining"],
  ["arcane", "alchemy", "perseverance"],
  ["arcane", "potions", "divination"],
  ["stealth", "traps", "animals"],
  ["stealth", "pick-pocketing", "disguise"],
  ["stealth", "anatomy", "cartography"],
  ["stealth", "lock-picking", "climbing"],
] as const;

describe("bundled Stage 02 rules", () => {
  it("deep-validates the versioned JSON snapshot", () => {
    expect(validateRulesDocument(rawRules)).toMatchObject({ success: true });
    expect(rules.rulesVersion).toBe("cc-7c61a5d-v1");
    expect(Object.isFrozen(rules)).toBe(true);
    expect(Object.isFrozen(rules.backgrounds)).toBe(true);
  });

  it("rejects malformed grant formulas and companion discriminants", () => {
    const malformedQuantity = structuredClone(rawRules);
    malformedQuantity.backgrounds[0]!.equipmentGrants[0]!.grants[0]!.quantity = {
      kind: "dice",
      count: 0,
      sides: 6,
    };
    const malformedCompanion = structuredClone(rawRules);
    malformedCompanion.companions[0]!.kind = "hireling";

    expect(validateRulesDocument(malformedQuantity)).toMatchObject({
      success: false,
      errors: [
        {
          path: "$.backgrounds[0].equipmentGrants[0].grants[0].quantity.count",
          message: "must be an integer >= 1",
        },
      ],
    });
    expect(validateRulesDocument(malformedCompanion)).toMatchObject({
      success: false,
      errors: [
        {
          path: "$.companions[0].kind",
          message: "must be one of: retainer, pet, mount",
        },
      ],
    });
  });

  it("contains all canonical backgrounds, traits, spells, and oracle rows", () => {
    expect(rules.backgrounds.map(({ d20Index }) => d20Index)).toEqual(
      Array.from({ length: 20 }, (_, index) => index + 1),
    );
    expect(rules.backgrounds.at(0)?.name).toBe("Roadwarden");
    expect(rules.backgrounds.at(-1)?.name).toBe("Burglar");
    expect(rules.backgrounds.map(({ talentIds }) => talentIds)).toEqual(auditedTalentTriplets);
    expect(Object.values(rules.traitTables).every((table) => table.length === 20)).toBe(true);
    expect(rules.spells).toHaveLength(36);
    expect(rules.spellWordingOracles[0]?.columns).toHaveLength(4);
    expect(rules.spellWordingOracles[0]?.columns.every(({ entries }) => entries.length === 20)).toBe(true);
  });

  it("preserves source-sensitive background loadouts", () => {
    expect(grantedItemIds("ranger")).toContain("short-sword");
    expect(grantedItemIds("bounty-hunter")).toEqual([
      "pistol",
      "ammo",
      "sturdy-rope",
      "manacles",
      "wanted-poster",
    ]);
    expect(grantedItemIds("duelist")).toEqual(["rapier", "pistol", "ammo", "light-armor"]);
    expect(grantedItemIds("slayer")).toEqual([
      "kickass-hat",
      "string-of-garlic",
      "holy-water",
      "silver-knife",
      "hawthorn-stake",
    ]);
    expect(grantedItemIds("burglar")).toEqual(["lock-picks", "soft-shoes", "burglar-hooded-cloak"]);
  });

  it("encodes quantities and alternatives declaratively", () => {
    const posters = background("bounty-hunter").equipmentGrants[0]?.grants.at(-1);
    const coins = background("charlatan").equipmentGrants[0]?.grants.at(-2);
    const coinDefinition = rules.items.find(({ id }) => id === coins?.itemId);
    expect(posters?.quantity).toEqual({ kind: "dice", count: 1, sides: 3 });
    expect(coins?.quantity).toEqual({ kind: "dice", count: 1, sides: 6 });
    expect(coinDefinition).toMatchObject({ slots: 1, trivial: false });
    expect(background("outlaw").equipmentGrants[0]?.kind).toBe("choose-one");
    expect(background("beggar").equipmentGrants[0]?.kind).toBe("choose-one");
  });

  it("rejects invented starting-scroll mechanics", () => {
    const malformedScroll = structuredClone(rawRules) as unknown as Record<string, unknown>;
    const scrolls = malformedScroll.scrolls as Record<string, unknown>[];
    scrolls[0]!.effects = ["Invented effect"];
    expect(validateRulesDocument(malformedScroll)).toMatchObject({
      success: false,
      errors: [
        {
          path: "$.scrolls[0].effects",
          message: "must be absent from a starting scroll",
        },
      ],
    });
  });

  it("records corrected item mechanics without legacy values", () => {
    const item = (id: string) => rules.items.find((entry) => entry.id === id);
    expect(item("night-vision-eyes")?.slots).toBe(1);
    expect(item("tonic-of-health")?.effects).toContain(
      "Heals d6 stamina, d4 STR, and any physical affliction when drunk.",
    );
    expect(item("soft-shoes")?.effects).toContain("Grant advantage on relevant saves.");
    expect(item("burglar-hooded-cloak")?.effects).toContain("Grants advantage on relevant saves.");
    expect(rules.scrolls.map(({ spellName }) => spellName)).toEqual(["Bless", "Heal"]);
    expect(rules.scrolls.every((scroll) => !("effects" in scroll))).toBe(true);
  });

  it("contains starting companion and loyalty definitions", () => {
    const squire = rules.companions.find(({ id }) => id === "squire");
    const ridingHorse = rules.companions.find(({ id }) => id === "riding-horse");
    const warhorse = rules.companions.find(({ id }) => id === "warhorse");
    const backgroundTalentIds = new Set(rules.backgrounds.flatMap(({ talentIds }) => talentIds));
    expect(squire?.kind === "retainer").toBe(true);
    expect(squireTalentIds).toHaveLength(rules.talents.length);
    expect(new Set(squireTalentIds).size).toBe(squireTalentIds.length);
    expect(new Set(squireTalentIds)).toEqual(backgroundTalentIds);
    expect(ridingHorse?.kind === "mount" ? ridingHorse.capacity : undefined).toEqual({ ridden: 10, unridden: 20 });
    expect(warhorse?.kind === "mount" ? warhorse.capacity : undefined).toEqual({ ridden: 5, unridden: 15 });
    expect(rules.retainerLoyalty.bands).toHaveLength(7);
  });

  it("rejects broken references and incomplete d20 tables", () => {
    const brokenReference = structuredClone(rawRules);
    brokenReference.backgrounds[0]!.talentIds[0] = "missing-talent";
    const brokenTable = structuredClone(rawRules);
    brokenTable.traitTables.physique.pop();

    expect(validateRulesDocument(brokenReference)).toMatchObject({
      success: false,
      errors: expect.arrayContaining([
        { path: "$.backgrounds[0].talentIds[0]", message: "unknown id: missing-talent" },
      ]),
    });
    expect(validateRulesDocument(brokenTable)).toMatchObject({
      success: false,
      errors: expect.arrayContaining([
        { path: "$.traitTables.physique", message: "must contain exactly 20 entries" },
      ]),
    });
  });
});

describe("Stage 02 provenance and convenience names", () => {
  it("pins the audited source and CC BY-SA attribution", () => {
    expect(provenance.rulesVersion).toBe(rules.rulesVersion);
    expect(provenance.sourceRevision).toMatch(/^[0-9a-f]{40}$/);
    expect(provenance.license).toBe("CC BY-SA 4.0");
    expect(provenance.attribution).toContain("Alexander Gomez");
    expect(provenance.attribution).toContain("The Chaos Consortium");
  });

  it("provides non-empty, duplicate-free identity and familiar name pools", () => {
    const pools = [
      names.human.masculine,
      names.human.feminine,
      names.human.family,
      names.ironicOrAbsurdFamiliar,
    ];
    expect(validateNameDocument(namesData)).toMatchObject({ success: true });
    expect(names.rulesVersion).toBe(rules.rulesVersion);
    pools.forEach((pool) => {
      expect(pool.length).toBeGreaterThan(0);
      expect(new Set(pool).size).toBe(pool.length);
    });
  });
});
