# Handoff - Stage 04 completion

**Date:** 2026-09-12

**Stage:** [Stage 04](../stages/04-pdf-templates.md)

**Branch:** `docs/development-plan`

**State:** completed

## Accomplished

- Audited all three supplied printable PDFs: unencrypted, zero rotation, no
  existing fields, and 792 × 612-point landscape pages.
- Added declarative PDF-point maps for the character front/notes, both uniquely
  prefixed retainer panels, and mount fields including all sixty inventory rows.
- Added `npm run prepare:pdf-templates`, which validates originals, creates
  transparent borderless AcroForm text fields, and writes editable derivatives
  to `templates/fillable/` without modifying originals.
- Added a debug command that creates ignored, flattened synthetic-label PDFs for
  visual coordinate review. The visual review confirmed field placement and no
  portrait placeholder.
- Fixed preparation metadata and serialization so repeated runs create
  byte-identical derivatives. Documented preparation and the Stage 05 font
  requirement in `templates/README.md`.

## Verification

| Command | Result |
| --- | --- |
| `npm run prepare:pdf-templates` | passed — 41/66/77 character/retainer/mount fields |
| Repeated derivative SHA-256 comparison | passed — byte-identical outputs |
| `npm run prepare:pdf-templates:debug` and visual inspection | passed — all mapped regions inspected with synthetic labels |
| `npm test` | passed — 6 test files; 56 tests passed |
| `npm run typecheck` | passed |
| `npm run build` | passed |
| `git diff --check` | passed |

## Next action

Stage 05 should map generated actor snapshots to these stable names, create
appearances, flatten filled sheets, and assemble character/companion output.

## Residual risks

- The blank forms use Helvetica for basic editable-field appearances. Stage 05
  must embed a Unicode-capable font and surface unsupported text explicitly.
- Actor rendering, overflow/continuation pages, and all-background PDF exports
  remain Stage 05 work.
