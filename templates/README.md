# Fillable template preparation

The three `* Printable.pdf` files in this directory are supplied originals and
must not be modified. `fillable/` contains reproducible editable derivatives.

## Copyright and redistribution

The supplied printable PDFs are copyright The Chaos Consortium LLC and
Alexander Gomez. The copyright holders authorize this repository and its GitHub
Pages deployment to distribute the originals and fillable derivatives. End users
may not sell or redistribute generated PDFs.

Run `npm run prepare:pdf-templates` from the repository root to validate the
original metadata and recreate every derivative. The command reads the
declarative PDF-point maps in `src/pdf/field-maps/`, adds transparent,
borderless text fields, and reports original SHA-256 hashes and field counts.

Run `npm run prepare:pdf-templates:transparent-fill` to remove fill colors from
existing derivatives without changing their field rectangles. Use this after
manual coordinate adjustments.

After approved manual coordinate adjustments, run
`npm run prepare:pdf-templates:sync-maps` to update the checked-in coordinate
maps from the existing derivatives. This expands repeating fields into explicit
records so the approved rectangles are reproduced exactly.

Run `npm run prepare:pdf-templates:debug` to create flattened synthetic-label
samples under ignored `templates/debug/` for visual coordinate inspection.
Those debug PDFs are not inputs to rendering and are not committed.

The blank field widgets use embedded Helvetica for basic editable-field
appearances. Completed PDFs reject characters Helvetica cannot encode explicitly
rather than silently dropping them.
