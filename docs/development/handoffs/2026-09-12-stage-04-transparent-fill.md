# Handoff - Stage 04 final template alignment

**Date:** 2026-09-12

**Stage:** [Stage 04](../stages/04-pdf-templates.md)

**Branch:** `docs/development-plan`

**State:** completed

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
- Synchronized the owner-approved widget rectangles into the checked-in maps,
  expanding repeated inventory definitions into explicit records where needed.
- Regenerated all derivatives from their printable originals; the output
  rectangles match the checked-in maps and repeated preparation is byte-identical.

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
| `npm run prepare:pdf-templates:sync-maps` | passed — 41/66/77 character/retainer/mount field rectangles synchronized |
| `npm run prepare:pdf-templates` | passed — regenerated from printable originals |
| Repeated derivative SHA-256 comparison | passed — byte-identical derivatives |
| `npm test` | passed — 6 test files; 65 tests passed, including rectangle-map checks |

## Next action

Stage 05 should map generated actor snapshots to the approved stable field
names, create appearances, flatten filled sheets, and assemble completed output.

## Residual risks

- Blank fields use Helvetica. Stage 05 must embed a Unicode-capable font for
  completed PDFs and report unsupported text explicitly.
