import type {
  AttributeName,
  AttributeSwapRecord,
  Attributes,
  GenerationRecord,
  OriginalRolls,
  RecordedRoll,
} from "./actors.ts";
import type { CharacterCreationDefinition, RetainerLoyaltyDefinition } from "./definitions.ts";
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

/** Rolls the independent starting attributes configured by the rules document. */
export function rollOriginalAttributes(
  random: RandomSource,
  attributeRoll: CharacterCreationDefinition["attributeRoll"] = { kind: "dice", count: 3, sides: 6 },
): OriginalAttributeRolls {
  return {
    strength: recordedRoll(random, "attribute.strength", attributeRoll),
    dexterity: recordedRoll(random, "attribute.dexterity", attributeRoll),
    willpower: recordedRoll(random, "attribute.willpower", attributeRoll),
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
  characterCreation: Pick<CharacterCreationDefinition, "inventoryMinimum" | "corruptionMaximumModifier"> = { inventoryMinimum: 10, corruptionMaximumModifier: 3 },
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
    inventoryCapacity: Math.max(scores.strength, characterCreation.inventoryMinimum),
    corruptionMaximum: scores.willpower + characterCreation.corruptionMaximumModifier,
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
export function deriveRetainerLoyalty(
  employerWillpower: number,
  loyalty: RetainerLoyaltyDefinition = { bands: [
    { minimumWillpower: 3, maximumWillpower: 3, loyalty: 4, retainerMaximum: 1 },
    { minimumWillpower: 4, maximumWillpower: 5, loyalty: 5, retainerMaximum: 2 },
    { minimumWillpower: 6, maximumWillpower: 8, loyalty: 6, retainerMaximum: 3 },
    { minimumWillpower: 9, maximumWillpower: 12, loyalty: 7, retainerMaximum: 4 },
    { minimumWillpower: 13, maximumWillpower: 15, loyalty: 8, retainerMaximum: 5 },
    { minimumWillpower: 16, maximumWillpower: 17, loyalty: 9, retainerMaximum: 6 },
    { minimumWillpower: 18, maximumWillpower: 18, loyalty: 10, retainerMaximum: 7 },
  ], sources: [] },
): RetainerLoyalty {
  if (!Number.isInteger(employerWillpower)) throw new RangeError("employerWillpower must be an integer");
  const band = loyalty.bands.find(({ minimumWillpower, maximumWillpower }) => employerWillpower >= minimumWillpower && employerWillpower <= maximumWillpower);
  if (band === undefined) throw new RangeError("employerWillpower is not covered by the retainer loyalty table");
  return { score: band.loyalty, retainerMaximum: band.retainerMaximum };
}

function recordedRoll(random: RandomSource, id: string, definition: CharacterCreationDefinition["attributeRoll"]): RecordedRoll {
  const result = rollDice(random, definition.count, definition.sides);
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
