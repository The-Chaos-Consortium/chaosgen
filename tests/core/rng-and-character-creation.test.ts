import { describe, expect, it } from "vitest";

import type { AttributeSwapRecord, GenerationRecord } from "../../src/core/actors.ts";
import {
  deriveCharacterCreation,
  deriveRetainerLoyalty,
  createOriginalRolls,
  replaceAttributeSwap,
  rollOriginalAttributes,
} from "../../src/core/character-creation.ts";
import {
  createSeededRandom,
  deriveBatchSeed,
  rollDice,
  rollDie,
  type RandomSource,
} from "../../src/core/rng.ts";

const sequence = (random: RandomSource, count: number): number[] =>
  Array.from({ length: count }, () => random.next());

describe("seeded randomness", () => {
  it("gives the same seed the same stream", () => {
    const expected = [
      0.9778225664049387,
      0.9500383387785405,
      0.8953071681316942,
      0.5201918666716665,
      0.5678558913059533,
      0.4072718843817711,
      0.4497552157845348,
      0.9789651380851865,
    ];
    expect(sequence(createSeededRandom("synthetic seed"), 8)).toEqual(expected);
    expect(sequence(createSeededRandom("synthetic seed"), 8)).toEqual(expected);
  });

  it("derives reproducible, distinct streams for batch items", () => {
    const first = deriveBatchSeed("batch root", 0);
    const second = deriveBatchSeed("batch root", 1);

    expect(first).toBe(deriveBatchSeed("batch root", 0));
    expect(first).not.toBe(second);
    expect(sequence(createSeededRandom(first), 5)).not.toEqual(
      sequence(createSeededRandom(second), 5),
    );
    expect(() => deriveBatchSeed("batch root", -1)).toThrow(RangeError);
  });
});

describe("dice", () => {
  it("uses inclusive one-through-sides bounds and records dice", () => {
    const values = [0, 0.999_999_999_9];
    const random: RandomSource = { next: () => values.shift() ?? 0 };

    expect(rollDie(random, 6)).toBe(1);
    expect(rollDie(random, 6)).toBe(6);
    expect(rollDice({ next: () => 0.5 }, 3, 6)).toEqual({ dice: [4, 4, 4], total: 12 });
  });

  it("rejects invalid dice arguments and invalid injected values", () => {
    expect(() => rollDie({ next: () => 1 }, 6)).toThrow("[0, 1)");
    expect(() => rollDie({ next: () => 0 }, 0)).toThrow("positive safe integer");
    expect(() => rollDice({ next: () => 0 }, 0, 6)).toThrow("positive safe integer");
  });
});

describe("original attribute rolls and swaps", () => {
  const originals = {
    strength: { id: "attribute.strength", dice: [6, 6, 6], total: 18 },
    dexterity: { id: "attribute.dexterity", dice: [1, 1, 1], total: 3 },
    willpower: { id: "attribute.willpower", dice: [2, 2, 2], total: 6 },
  } as const;

  it("rolls explicit independent 3d6 records", () => {
    const rolled = rollOriginalAttributes(createSeededRandom("attributes"));
    expect(Object.values(rolled).map((roll) => roll.id)).toEqual([
      "attribute.strength",
      "attribute.dexterity",
      "attribute.willpower",
    ]);
    expect(Object.values(rolled).every((roll) => roll.dice.length === 3)).toBe(true);
    expect(createOriginalRolls(createSeededRandom("attributes"))).toEqual({
      attributes: rolled,
      additional: [],
    });
  });

  it("replaces or clears one swap from originals, refreshing derivations", () => {
    const firstSwap: AttributeSwapRecord = { first: "strength", second: "willpower" };
    const replacement: AttributeSwapRecord = { first: "dexterity", second: "willpower" };
    const generation: GenerationRecord = {
      originalRolls: { attributes: originals, additional: [] },
      choices: [],
      attributeSwap: firstSwap,
    };

    expect(deriveCharacterCreation(generation.originalRolls, firstSwap)).toMatchObject({
      attributes: { strength: { current: 6, maximum: 6 }, willpower: { current: 18, maximum: 18 } },
      inventoryCapacity: 10,
      corruptionMaximum: 21,
    });
    const replaced = replaceAttributeSwap(generation, replacement);
    expect(replaced.attributeSwap).toEqual(replacement);
    expect(deriveCharacterCreation(replaced.originalRolls, replaced.attributeSwap)).toMatchObject({
      attributes: { strength: { current: 18 }, dexterity: { current: 6 }, willpower: { current: 3 } },
      inventoryCapacity: 18,
      corruptionMaximum: 6,
    });
    const cleared = replaceAttributeSwap(replaced);
    expect(cleared.attributeSwap).toBeUndefined();
    expect(deriveCharacterCreation(cleared.originalRolls, cleared.attributeSwap).attributes).toEqual({
      strength: { current: 18, maximum: 18 },
      dexterity: { current: 3, maximum: 3 },
      willpower: { current: 6, maximum: 6 },
    });
  });

  it("requires a swap to name two different attributes", () => {
    expect(() => deriveCharacterCreation({ attributes: originals, additional: [] }, { first: "strength", second: "strength" })).toThrow(
      "two different",
    );
  });
});

describe("confirmed derivations", () => {
  it.each([
    [3, { score: 4, retainerMaximum: 1 }],
    [4, { score: 5, retainerMaximum: 2 }],
    [6, { score: 6, retainerMaximum: 3 }],
    [9, { score: 7, retainerMaximum: 4 }],
    [13, { score: 8, retainerMaximum: 5 }],
    [16, { score: 9, retainerMaximum: 6 }],
    [18, { score: 10, retainerMaximum: 7 }],
  ])("maps employer WIL %i to its loyalty row", (willpower, expected) => {
    expect(deriveRetainerLoyalty(willpower)).toEqual(expected);
  });

  it("rejects employer WIL outside the confirmed table", () => {
    expect(() => deriveRetainerLoyalty(2)).toThrow(RangeError);
    expect(() => deriveRetainerLoyalty(18.5)).toThrow(RangeError);
  });
});
