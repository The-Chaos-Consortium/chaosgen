# Handoff - Stage 04 transparent field fills

**Date:** 2026-09-12

**Stage:** [Stage 04](../stages/04-pdf-templates.md)

**Branch:** `docs/development-plan`

**State:** in progress - coordinate-map reconciliation pending

## Accomplished

- Updated all existing fillable derivatives in place to remove text-field
  background colors, preserving the field rectangles already adjusted by the
  owner.
- Updated normal template preparation so newly generated fields also have no
  background color.
- Added `npm run prepare:pdf-templates:transparent-fill` for applying the same
  style correction after future manual coordinate adjustments.
- Added a test requiring every widget to have no configured background color.
- Backed up the owner-aligned derivatives in commit `aa15f82` before changing
  field appearance properties.
- Set inventory, spells, talents, and notes fields to left alignment; all other
  text fields are centered without changing their rectangles.
- The owner visually approved the field alignment. Removed the obsolete
  `char-sheet.pdf` and `hireling-sheet.pdf` legacy templates.

## Verification

| Command | Result |
| --- | --- |
| `npm run prepare:pdf-templates:transparent-fill` | passed — character/retainer/mount fields: 41/66/77 |
| `npm test` | passed — 6 test files; 59 tests passed |
| `npm run typecheck` | passed |
| `git diff --check` | passed |
| `npm run prepare:pdf-templates:transparent-fill` | passed — applied alignment in place to 41/66/77 character/retainer/mount fields |
| `npm test` | passed — 6 test files; 62 tests passed, including alignment checks |
| `npm run build` | passed |

## Next action

Update the coordinate maps to match the owner-approved fillable derivative
positions. Keep the approved derivative changes; do not run the normal
regeneration command until that reconciliation is complete.

## Residual risks

- Field appearance, count, dimensions, alignment, and visual placement are
  verified. The checked-in coordinate maps must still be reconciled before
  derivatives can be reproduced from their printable originals.
