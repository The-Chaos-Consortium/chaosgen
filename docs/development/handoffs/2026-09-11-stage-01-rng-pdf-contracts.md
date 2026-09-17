# Handoff - stage 01: RNG and PDF contracts

**Date:** 2026-09-11

**Stage:** [Stage 01](../stages/01-foundation.md)

**Branch:** `docs/development-plan`

**State:** partial

## Accomplished

- Added injected seeded randomness, versioned batch seeds, and dice helpers in
  `src/core/rng.ts`.
- Added single-authority original-roll provenance, replacement/clear attribute
  swaps, and confirmed creation derivations in `src/core/character-creation.ts`.
- Added platform-neutral renderer, template-byte, and output-byte contracts in
  `src/pdf/contracts.ts`.
- Added integrated synthetic tests under `tests/core/` and `tests/pdf/`.

## Working tree and Git state

- This checkpoint is committed but not pushed.
- Generated `dist/` and installed dependencies remain ignored.

## Verification

| Check/command | Result | Evidence or limitation |
| --- | --- | --- |
| `npm test` | passed | 3 files and 34 tests passed |
| `npm run typecheck` | passed | Strict TypeScript completed without errors |
| `npm run build` | passed | Vite production build completed |
| `git diff --check` | passed | No whitespace errors |

## Decisions and blockers

- Seed streams use UTF-8 FNV-1a followed by Mulberry32; golden tests preserve the
  algorithm. Batch seeds use a versioned, zero-based derivation string.
- Attribute swaps always derive from original rolls and cannot chain.
- PDF rendering receives actor snapshots and supplied bytes only; platform adapters
  own loading and writing. Character bytes are statically required.
- No blocker was found.

## Next steps

1. Document Stage 01 scripts and contract boundaries for downstream stages.
2. Re-run the completion-gate checks, update ignores if needed, and complete Stage 01.
