# Handoff - Stage 03 completion

**Date:** 2026-09-12

**Stage:** [Stage 03](../stages/03-generation.md)

**Branch:** `docs/development-plan`

**State:** completed

## Accomplished

- Added `src/core/generation.ts`, a pure generator that consumes frozen rules
  definitions and an injected `RandomSource`.
- Records generated dice and choices, including quantity formulas; creates
  independent, slot-addressed inventory instances and preserves over-capacity
  gear.
- Generates all backgrounds, starting spells (random example, chosen example,
  or custom wording), scroll names, and the four background-granted companion
  kinds. Mounts start without automatically transferred character gear.
- Derives inventory capacity, corruption maximum, armor eligibility, and squire
  loyalty from actor state. Customization rebuilds those derivations from
  original rolls and a single replacement attribute swap without mutation or
  rerolls.
- Added deterministic coverage for reproducibility, all backgrounds, capacity,
  companions, squire talent uniqueness, armor, swaps, and spell customization.

## Verification

| Command | Result |
| --- | --- |
| `npm test` | passed — 5 test files; 51 tests passed |
| `npm run typecheck` | passed |
| `npm run build` | passed — typecheck and Vite production build completed |
| `git diff --check` | passed |

## Next action

Stage 04 can prepare the printable PDF derivatives and coordinate maps. It can
consume complete generated actor data, but rendering remains a separate stage.

## Residual risks

- Initial mount ridden state remains `false` and starting gear remains on the
  character; this is explicit state rather than an inferred transfer.
- Faction display/export privacy treatment remains an interface decision.
- PDF field capacity and visual fit remain untested until Stages 04 and 05.
