import { describe, expect, it } from "vitest";

import type {
  ActorSnapshot,
  Attributes,
  GeneratedActorDocument,
  ValueTrack,
} from "../../src/core/actors.ts";
import type { RulesDefinitionDocument, TraitTables } from "../../src/core/definitions.ts";
import {
  validateActorEnvelope,
  validateRulesEnvelope,
} from "../../src/core/validation.ts";

const track = (current: number, maximum = current): ValueTrack => ({
  current,
  maximum,
});

const attributes = (strength: number, dexterity: number, willpower: number): Attributes => ({
  strength: track(strength),
  dexterity: track(dexterity),
  willpower: track(willpower),
});

const actors = [
  {
    id: "character-1",
    kind: "character",
    name: "Synthetic Adventurer",
    identity: { age: 24, ancestry: "Human" },
    background: { id: "test-background", name: "Test Background" },
    faction: "Balance",
    rank: "Novice",
    traits: {
      physique: "Tall",
      face: "Angular",
      skin: "Freckled",
      hair: "Braided",
      clothing: "Patched",
      virtue: "Patient",
      vice: "Proud",
      speech: "Measured",
      misfortune: "Bad maps",
    },
    attributes: attributes(9, 10, 11),
    stamina: track(4),
    corruption: track(0, 14),
    inventoryCapacity: 10,
    currency: { amount: 120, unit: "silver-pennies" },
    talents: [{ name: "Test Talent" }],
    inventory: [],
    spellBooks: [],
    scrolls: [],
    companions: [],
    notes: [],
  },
  {
    id: "retainer-1",
    kind: "retainer",
    definitionId: "synthetic-squire",
    name: "Synthetic Squire",
    role: "Squire",
    attributes: attributes(8, 9, 10),
    stamina: track(3),
    inventoryCapacity: 10,
    loyalty: { score: 7, retainerMaximum: 4 },
    talents: [],
    inventory: [],
    notes: [],
  },
  {
    id: "pet-1",
    kind: "pet",
    definitionId: "synthetic-familiar",
    petKind: "familiar",
    name: "Accountant",
    attributes: attributes(6, 10, 10),
    stamina: track(2),
    morale: 7,
    attacks: [],
    notes: [],
  },
  {
    id: "mount-1",
    kind: "mount",
    definitionId: "synthetic-horse",
    name: "Synthetic Horse",
    attributes: attributes(10, 14, 10),
    stamina: track(6),
    morale: 7,
    ridden: true,
    capacity: { ridden: 10, unridden: 20 },
    attacks: ["Kick d6"],
    abilities: [],
    inventory: [],
    notes: [],
  },
] as const satisfies readonly ActorSnapshot[];

describe("validateActorEnvelope", () => {
  it.each(actors)("accepts a valid $kind snapshot envelope", (actor) => {
    const document = {
      schemaVersion: "1",
      rulesVersion: "test-rules",
      seed: "synthetic-seed",
      generation: {
        originalRolls: {
          attributes: {
            strength: { id: "attribute.strength", dice: [3, 3, 3], total: 9 },
            dexterity: { id: "attribute.dexterity", dice: [3, 3, 4], total: 10 },
            willpower: { id: "attribute.willpower", dice: [3, 4, 4], total: 11 },
          },
          additional: [],
        },
        choices: [],
      },
      actor,
    } satisfies GeneratedActorDocument;

    const result = validateActorEnvelope(document);

    expect(result).toMatchObject({
      success: true,
      value: {
        schemaVersion: "1",
        rulesVersion: "test-rules",
        seed: "synthetic-seed",
        generation: {
          originalRolls: {
            attributes: {
              strength: { id: "attribute.strength", dice: [3, 3, 3], total: 9 },
              dexterity: { id: "attribute.dexterity", dice: [3, 3, 4], total: 10 },
              willpower: { id: "attribute.willpower", dice: [3, 4, 4], total: 11 },
            },
            additional: [],
          },
          choices: [],
        },
        actor: { id: actor.id, kind: actor.kind },
      },
    });
  });

  it("enforces mount-specific capacity without accepting string coercion", () => {
    const result = validateActorEnvelope({
      schemaVersion: "1",
      rulesVersion: "rules",
      seed: "seed",
      generation: {
        originalRolls: {
          attributes: {
            strength: { id: "attribute.strength", dice: [3, 3, 3], total: 9 },
            dexterity: { id: "attribute.dexterity", dice: [3, 3, 4], total: 10 },
            willpower: { id: "attribute.willpower", dice: [3, 4, 4], total: 11 },
          },
          additional: [],
        },
        choices: [],
      },
      actor: {
        id: "mount-1",
        kind: "mount",
        morale: 7,
        ridden: true,
        capacity: { ridden: "10", unridden: 20 },
      },
    });

    expect(result).toEqual({
      success: false,
      errors: [
        {
          path: "$.actor.capacity.ridden",
          message: "must be a finite number",
        },
      ],
    });
  });

  it("reports path-aware errors without coercing malformed JSON values", () => {
    const result = validateActorEnvelope({
      schemaVersion: 1,
      rulesVersion: "rules",
      seed: "seed",
      generation: { originalRolls: "3d6", choices: [] },
      actor: { id: "actor-1", kind: "hireling" },
    });

    expect(result).toEqual({
      success: false,
      errors: [
        { path: "$.schemaVersion", message: "must be a non-empty string" },
        { path: "$.generation.originalRolls", message: "must be an object" },
        {
          path: "$.actor.kind",
          message: "must be one of: character, retainer, pet, mount",
        },
      ],
    });
  });

  it("requires a usable explicit original attribute mapping", () => {
    const result = validateActorEnvelope({
      schemaVersion: "1",
      rulesVersion: "rules",
      seed: "seed",
      generation: {
        originalRolls: {
          attributes: {
            strength: { id: "attribute.strength", dice: [3, 3, 3], total: 9 },
            dexterity: { id: "attribute.dexterity", dice: [3, 3, 4], total: 10 },
            willpower: { id: "attribute.willpower", dice: [3, "bad", 4], total: 11 },
          },
          additional: [],
        },
        choices: [],
      },
      actor: { id: "character-1", kind: "character" },
    });

    expect(result).toEqual({
      success: false,
      errors: [{ path: "$.generation.originalRolls.attributes.willpower.dice[1]", message: "must be a positive safe integer" }],
    });
  });

  it("rejects original rolls with mismatched IDs, dice, and totals", () => {
    const result = validateActorEnvelope({
      schemaVersion: "1", rulesVersion: "rules", seed: "seed",
      generation: { originalRolls: { attributes: {
        strength: { id: "attribute.dexterity", dice: [3, 3, 3], total: 9 },
        dexterity: { id: "attribute.dexterity", dice: [0, 3, 4], total: 7 },
        willpower: { id: "attribute.willpower", dice: [3, 4, 4], total: 99 },
      }, additional: [] }, choices: [] },
      actor: { id: "character-1", kind: "character" },
    });

    expect(result).toEqual({ success: false, errors: [
      { path: "$.generation.originalRolls.attributes.strength.id", message: "must be attribute.strength" },
      { path: "$.generation.originalRolls.attributes.dexterity.dice[0]", message: "must be a positive safe integer" },
      { path: "$.generation.originalRolls.attributes.willpower.total", message: "must equal the sum of dice" },
    ] });
  });
});

const traitTables = {
  physique: [{ d20Index: 1, value: "Tall" }],
  face: [{ d20Index: 1, value: "Angular" }],
  skin: [{ d20Index: 1, value: "Freckled" }],
  hair: [{ d20Index: 1, value: "Braided" }],
  clothing: [{ d20Index: 1, value: "Patched" }],
  virtue: [{ d20Index: 1, value: "Patient" }],
  vice: [{ d20Index: 1, value: "Proud" }],
  speech: [{ d20Index: 1, value: "Measured" }],
  misfortune: [{ d20Index: 1, value: "Bad maps" }],
} as const satisfies TraitTables;

const rules = {
  schemaVersion: "1",
  rulesVersion: "test-rules",
  characterCreation: {
    attributeRoll: { kind: "dice", count: 3, sides: 6 },
    staminaRoll: { kind: "dice", count: 1, sides: 6 },
    randomAgeRoll: { kind: "dice", count: 2, sides: 10 },
    randomAgeBase: 16,
    minimumChosenAge: 18,
    inventoryMinimum: 10,
    corruptionMaximumModifier: 3,
    wealthRoll: { kind: "dice", count: 6, sides: 6 },
    wealthMultiplier: 10,
    currencyUnit: "silver-pennies",
    ancestry: "Human",
    rank: "Novice",
    factions: ["Chaos", "Law", "Balance"],
    sharedEquipmentGrants: [],
    sources: [],
  },
  retainerLoyalty: {
    bands: [{ minimumWillpower: 3, maximumWillpower: 18, loyalty: 7, retainerMaximum: 4 }],
    sources: [],
  },
  squireTalentIds: ["test-talent"],
  talents: [{ id: "test-talent", name: "Test Talent", description: "Synthetic", sources: [] }],
  traitTables,
  backgrounds: [
    {
      id: "test-background",
      d20Index: 1,
      name: "Test Background",
      description: "Synthetic",
      talentIds: ["test-talent"],
      equipmentGrants: [
        { kind: "receive-all", grants: [{ itemId: "test-dagger", quantity: { kind: "fixed", value: 1 } }] },
        { kind: "choose-one", grants: [{ itemId: "test-dagger", quantity: { kind: "fixed", value: 1 } }] },
      ],
      companionDefinitionIds: [],
      spellBookDefinitionIds: ["test-grimoire"],
      scrollDefinitionIds: ["test-bless-scroll"],
      sources: [],
    },
  ],
  items: [{ id: "test-dagger", name: "Test Dagger", slots: 1, trivial: false, sources: [] }],
  spells: [{ id: "test-spell", name: "Test Spell", wording: "Synthetic", sources: [] }],
  spellBooks: [
    { id: "test-grimoire", name: "Test Grimoire", slots: 2, capacity: 6, startingSpellCount: 1, spellIds: ["test-spell"], sources: [] },
  ],
  scrolls: [
    { id: "test-bless-scroll", name: "Bless Scroll", spellName: "Bless", slots: 1, sources: [] },
  ],
  spellWordingOracles: [
    {
      id: "test-oracle",
      columns: [{ id: "effect", label: "Effect", entries: [{ d20Index: 1, value: "Test" }] }],
      sources: [],
    },
  ],
  companions: [
    {
      id: "synthetic-squire",
      kind: "retainer",
      name: "Synthetic Squire",
      role: "Squire",
      attributes: {
        strength: { kind: "dice", count: 3, sides: 6 },
        dexterity: { kind: "dice", count: 3, sides: 6 },
        willpower: { kind: "dice", count: 3, sides: 6 },
      },
      stamina: { kind: "dice", count: 1, sides: 6 },
      inventoryCapacity: 10,
      equipmentGrants: [],
      talentSelectionCount: 3,
      sources: [],
    },
    {
      id: "synthetic-familiar",
      kind: "pet",
      petKind: "familiar",
      name: "Synthetic Familiar",
      attributes: {
        strength: { kind: "fixed", value: 6 },
        dexterity: { kind: "fixed", value: 10 },
        willpower: { kind: "fixed", value: 10 },
      },
      stamina: { kind: "fixed", value: 2 },
      morale: 7,
      attacks: [],
      sources: [],
    },
    {
      id: "synthetic-horse",
      kind: "mount",
      name: "Synthetic Horse",
      attributes: {
        strength: { kind: "fixed", value: 10 },
        dexterity: { kind: "fixed", value: 14 },
        willpower: { kind: "fixed", value: 10 },
      },
      stamina: { kind: "fixed", value: 6 },
      morale: 7,
      capacity: { ridden: 10, unridden: 20 },
      attacks: ["Kick d6"],
      abilities: [],
      sources: [],
    },
  ],
} as const satisfies RulesDefinitionDocument;

describe("validateRulesEnvelope", () => {
  it("accepts declarative talent, trait, spell, item, and companion envelopes", () => {
    const result = validateRulesEnvelope(rules);

    expect(result).toMatchObject({
      success: true,
      value: {
        traitTables: { physique: [{ d20Index: 1, value: "Tall" }] },
        companions: [
          { id: "synthetic-squire", kind: "retainer" },
          { id: "synthetic-familiar", kind: "pet" },
          { id: "synthetic-horse", kind: "mount" },
        ],
      },
    });
  });

  it("identifies a malformed companion definition by array path", () => {
    const result = validateRulesEnvelope({ ...rules, companions: [{ id: "companion-1", kind: "animal" }] });

    expect(result).toEqual({
      success: false,
      errors: [
        {
          path: "$.companions[0].kind",
          message: "must be one of: retainer, pet, mount",
        },
      ],
    });
  });

  it("requires all nine trait-table envelopes without coercion", () => {
    const result = validateRulesEnvelope({
      ...rules,
      traitTables: { ...traitTables, vice: "not-an-array" },
    });

    expect(result).toEqual({
      success: false,
      errors: [{ path: "$.traitTables.vice", message: "must be an array" }],
    });
  });

  it("rejects duplicate companion definition identifiers", () => {
    const result = validateRulesEnvelope({
      ...rules,
      companions: [
        { id: "duplicate", kind: "retainer" },
        { id: "duplicate", kind: "mount" },
      ],
    });

    expect(result).toEqual({
      success: false,
      errors: [{ path: "$.companions[1].id", message: "must be unique among companions" }],
    });
  });
});
