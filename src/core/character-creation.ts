import type {
  AttributeName,
  AttributeSwapRecord,
  Attributes,
  GenerationRecord,
  OriginalRolls,
  RecordedRoll,
} from "./actors.ts";
import { rollDice, type RandomSource } from "./rng.ts";

export type OriginalAttributeRolls = Readonly<Record<AttributeName, RecordedRoll>>;

export interface CharacterCreationDerivations {
  readonly attributes: Attributes;
  readonly inventoryCapacity: number;
  readonly corruptionMaximum: number;
}

export interface RetainerLoyalty {
  readonly score: number;
  readonly retainerMaximum: number;
}

/** Rolls the three independent 3d6 starting attributes and records every die. */
export function rollOriginalAttributes(random: RandomSource): OriginalAttributeRolls {
  return {
    strength: recordedRoll(random, "attribute.strength"),
    dexterity: recordedRoll(random, "attribute.dexterity"),
    willpower: recordedRoll(random, "attribute.willpower"),
  };
}

/** Creates the complete original-roll provenance shape before later rolls are added. */
export function createOriginalRolls(random: RandomSource): OriginalRolls {
  return { attributes: rollOriginalAttributes(random), additional: [] };
}

/**
 * Derives current creation state from immutable original rolls. A swap always
 * replaces (rather than composes with) a prior swap; omit it to clear the swap.
 */
export function deriveCharacterCreation(
  originalRolls: OriginalRolls,
  swap?: AttributeSwapRecord,
): CharacterCreationDerivations {
  assertSwap(swap);
  const { attributes: originalAttributes } = originalRolls;
  const scores = {
    strength: originalAttributes.strength.total,
    dexterity: originalAttributes.dexterity.total,
    willpower: originalAttributes.willpower.total,
  };
  if (swap !== undefined) {
    [scores[swap.first], scores[swap.second]] = [scores[swap.second], scores[swap.first]];
  }
  const attributes: Attributes = {
    strength: track(scores.strength),
    dexterity: track(scores.dexterity),
    willpower: track(scores.willpower),
  };
  return {
    attributes,
    inventoryCapacity: Math.max(scores.strength, 10),
    corruptionMaximum: scores.willpower + 3,
  };
}

/** Returns provenance with a replacement swap, or clears it when omitted. */
export function replaceAttributeSwap(
  generation: GenerationRecord,
  swap?: AttributeSwapRecord,
): GenerationRecord {
  assertSwap(swap);
  if (swap !== undefined) return { ...generation, attributeSwap: swap };
  const { attributeSwap: _previousSwap, ...cleared } = generation;
  return cleared;
}

/** Confirmed employer-WIL loyalty table for retainers. */
export function deriveRetainerLoyalty(employerWillpower: number): RetainerLoyalty {
  if (!Number.isInteger(employerWillpower) || employerWillpower < 3 || employerWillpower > 18) {
    throw new RangeError("employerWillpower must be an integer from 3 through 18");
  }
  if (employerWillpower === 3) return { score: 4, retainerMaximum: 1 };
  if (employerWillpower <= 5) return { score: 5, retainerMaximum: 2 };
  if (employerWillpower <= 8) return { score: 6, retainerMaximum: 3 };
  if (employerWillpower <= 12) return { score: 7, retainerMaximum: 4 };
  if (employerWillpower <= 15) return { score: 8, retainerMaximum: 5 };
  if (employerWillpower <= 17) return { score: 9, retainerMaximum: 6 };
  return { score: 10, retainerMaximum: 7 };
}

function recordedRoll(random: RandomSource, id: string): RecordedRoll {
  const result = rollDice(random, 3, 6);
  return { id, ...result };
}

function track(value: number): { readonly current: number; readonly maximum: number } {
  return { current: value, maximum: value };
}

function assertSwap(swap: AttributeSwapRecord | undefined): void {
  if (swap !== undefined && swap.first === swap.second) {
    throw new RangeError("attribute swap must name two different attributes");
  }
}
