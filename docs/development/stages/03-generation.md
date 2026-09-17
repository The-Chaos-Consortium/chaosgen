# Stage 03 — Generation and customization

**Status:** completed

**Dependencies:** Stages 01 and 02

## Deliverable

Pure shared generation returning complete, stable character and companion data.

## Tasks

- [x] Implement creation formulas, identity/traits, background grants, and spells.
- [x] Implement seeded choices/quantities and independent inventory instances.
- [x] Generate squire, familiar, dog, and mounts using confirmed rules.
- [x] Implement one optional two-score swap against original rolls.
- [x] Derive capacity, corruption, armor restrictions, and retainer loyalty.
- [x] Validate customization without unrelated rerolls or state mutation.
- [x] Test formula bounds, reproducibility, independence, all backgrounds, and
  squire talent uniqueness; include deterministic edge cases rather than flaky
  statistical assertions.

## Completion gate

All actor kinds and derived values are correct; rendering needs no further dice
rolls. Excess equipment is preserved and distinguishable from legal capacity.

## Verification evidence

| Command | Result |
| --- | --- |
| `npm test` | passed — 5 test files; 51 tests passed |
| `npm run typecheck` | passed — strict TypeScript checking completed |
| `npm run build` | passed — typecheck and Vite production build completed |
| `git diff --check` | passed |

## Partial-work checkpoint

Completed. Next: Stage 04 can prepare fillable PDF templates independently of
the completed pure generation core.
