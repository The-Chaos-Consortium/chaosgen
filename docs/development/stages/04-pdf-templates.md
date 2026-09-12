# Stage 04 — Fillable PDF templates

**Status:** in_progress - transparent-fill follow-up

**Dependencies:** Stage 01 tooling; original PDFs available

## Deliverable

Reproducible fillable derivatives of all three printable sheets, plus field maps.

## Tasks

- [x] Inspect dimensions, rotation, encryption, and existing fields of originals.
- [x] Map character front and notes page fields in PDF points.
- [x] Map both retainer panels with unique field prefixes.
- [x] Map mount identity/statistics/morale, sixty inventory rows, and notes.
- [x] Implement preparation script without modifying originals.
- [x] Generate derivatives with transparent fields and correct multiline settings.
- [x] Check field names/rectangles programmatically and visually inspect debug fills.
- [x] Document preparation command, asset locations, and font strategy.

## Completion gate

All three forms have usable named fields aligned within printed regions. No
portrait text placeholder or assumption that printed inventory lines equal capacity.

## Verification evidence

| Command / review | Result |
| --- | --- |
| `npm run prepare:pdf-templates` | passed — original metadata validated; character/retainer/mount fields: 41/66/77 |
| Repeated preparation SHA-256 | passed — byte-identical derivatives after deterministic metadata/serialization |
| `npm run prepare:pdf-templates:debug` | passed — generated flattened synthetic-label samples under ignored `templates/debug/` |
| Visual inspection | passed — inspected character front/notes, both retainer panels, and mount inventory/notes regions; no portrait field; labels remained in intended printed regions |
| `npm test` | passed — 6 test files; 56 tests passed |
| `npm run typecheck` | passed |
| `npm run prepare:pdf-templates:transparent-fill` | passed — applied requested text alignment without changing existing field rectangles |
| `npm test` | passed — 6 test files; 62 tests passed, including transparent-fill and alignment checks on every widget |
| `npm run build` | passed |
| `npm run build` | passed |
| `git diff --check` | passed |
| `npm run prepare:pdf-templates:transparent-fill` | passed — removed background colors in place from all 41 character, 66 retainer, and 77 mount fields without regenerating coordinate maps |
| `npm test` | passed — 6 test files; 59 tests passed, including transparent-fill checks on every widget |
| `npm run typecheck` | passed |

Original metadata: all three supplied PDFs are unencrypted, have no existing
fields, have zero-degree rotation, and use 792 × 612-point landscape pages.
Original SHA-256: character `39fbda3569fad818cad60e25dd6afbab50e606557786d75318912f7054093adc`;
retainer `59e4132152cdb42c2018f52308b44b8e7032f54e98ddf3468b7821eda87cdd38`;
mount `4d1ed9bbbc57bd8eb1e59f5be61b40514fc9b40581bb56ae4193471731f2a958`.

## Field-style follow-up

All generated text fields have transparent fills. Inventory, spells, talents,
and notes are left-aligned; every other field is center-aligned. The owner
manually positioned the fields and their three derivatives were backed up in
commit `aa15f82` before field-alignment changes. The owner visually approved the
result. The obsolete `char-sheet.pdf` and `hireling-sheet.pdf` legacy templates
were removed from `templates/`.

## Partial-work checkpoint

Field-style corrections and visual alignment are verified. Next: update the
checked-in PDF-point maps to reproduce the owner-approved derivative positions
before the Stage 05 handoff resumes.
