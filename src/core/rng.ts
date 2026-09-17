/**
 * Source of uniformly distributed values in the half-open interval [0, 1).
 * Generation receives one explicitly; core code never selects a global source.
 */
export interface RandomSource {
  next(): number;
}

/**
 * Returns the per-character seed for a zero-based batch item.
 *
 * The `batch-v1` namespace, decimal index, UTF-16 code-unit length, and root
 * seed are encoded in that order. The length prefix makes arbitrary root seeds
 * unambiguous. This textual representation is the persisted seed passed to
 * `createSeededRandom`; do not change it without a new derivation version.
 */
export function deriveBatchSeed(rootSeed: string, itemIndex: number): string {
  if (!Number.isSafeInteger(itemIndex) || itemIndex < 0) {
    throw new RangeError("itemIndex must be a non-negative safe integer");
  }
  return `batch-v1/${itemIndex}/${rootSeed.length}:${rootSeed}`;
}

/**
 * Creates a deterministic source from a string seed.
 *
 * `seed` is UTF-8 encoded, hashed with 32-bit FNV-1a (offset 0x811c9dc5,
 * prime 0x01000193), then advanced with Mulberry32. All intermediate integer
 * operations are unsigned 32-bit values. `next()` returns one of 2^32 equally
 * spaced values in [0, 1). This is a reproducibility algorithm, not a
 * cryptographic random-number generator; its version is fixed by this contract.
 */
export function createSeededRandom(seed: string): RandomSource {
  let state = fnv1a32(seed);
  return {
    next(): number {
      state = (state + 0x6d2b79f5) >>> 0;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 0x1_0000_0000;
    },
  };
}

/** Rolls one die with inclusive results from 1 through `sides`. */
export function rollDie(random: RandomSource, sides: number): number {
  assertPositiveSafeInteger(sides, "sides");
  const value = random.next();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError("random source must return a finite value in [0, 1)");
  }
  return Math.floor(value * sides) + 1;
}

/** Rolls `count` dice, returning every inclusive die result and its total. */
export function rollDice(
  random: RandomSource,
  count: number,
  sides: number,
): { readonly dice: readonly number[]; readonly total: number } {
  assertPositiveSafeInteger(count, "count");
  assertPositiveSafeInteger(sides, "sides");
  const dice = Array.from({ length: count }, () => rollDie(random, sides));
  return { dice, total: dice.reduce((total, die) => total + die, 0) };
}

function fnv1a32(seed: string): number {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(seed)) {
    hash = Math.imul(hash ^ byte, 0x01000193) >>> 0;
  }
  return hash;
}

function assertPositiveSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive safe integer`);
  }
}
