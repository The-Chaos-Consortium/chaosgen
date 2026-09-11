# Handoff - stage 01: model contracts

**Date:** 2026-09-11

**Stage:** [Stage 01](../stages/01-foundation.md)

**Branch:** `docs/development-plan`

**State:** partial

## Accomplished

- Added immutable rules-definition contracts in `src/core/definitions.ts` for
  backgrounds, talents, traits, items, spells, grants, and companions.
- Added readonly actor snapshots in `src/core/actors.ts` for characters,
  retainers, pets/familiars, and mounts, including generation provenance.
- Added dependency-free, path-aware external envelope validation in
  `src/core/validation.ts` without coercion or executable randomness.
- Added synthetic validation coverage in `tests/core/validation.test.ts` and
  made the test command require at least one test file.

## Working tree and Git state

- The checkpoint contains the core contracts, validation tests, package script
  update, Stage 01 checklist/evidence, status dashboard, and this handoff.
- The checkpoint is committed but not pushed.

## Verification

| Check/command | Result | Evidence or limitation |
| --- | --- | --- |
| `npm test` | passed | 1 file and 10 tests passed |
| `npm run typecheck` | passed | Strict TypeScript completed without errors |
| `npm run build` | passed | Vite production build completed |
| `git diff --check` | passed | No whitespace errors |

## Decisions and blockers

- Rules definitions contain declarative fixed/dice descriptions only; they do
  not evaluate randomness.
- Actor data is modeled as readonly snapshots updated by replacement.
- Envelope validators return narrow validated envelopes rather than casting
  partially checked JSON to complete domain documents.
- Stage 02 must add complete nested parsing, reference checks, d20 table
  completeness, quantity constraints, and dataset-wide identifier validation.
- No blocker was found.

## Next steps

1. Define the injected seeded RNG interface and deterministic batch seed derivation.
2. Implement the original-roll attribute swap operation so repeated edits always
   derive from the original scores and permit at most one pair swap.
