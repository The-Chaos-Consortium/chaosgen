# Fillable template preparation

The three `* Printable.pdf` files in this directory are supplied originals and
must not be modified. `fillable/` contains reproducible editable derivatives.

Run `npm run prepare:pdf-templates` from the repository root to validate the
original metadata and recreate every derivative. The command reads the
declarative PDF-point maps in `src/pdf/field-maps/`, adds transparent,
borderless text fields, and reports original SHA-256 hashes and field counts.

Run `npm run prepare:pdf-templates:debug` to create flattened synthetic-label
samples under ignored `templates/debug/` for visual coordinate inspection.
Those debug PDFs are not inputs to rendering and are not committed.

The blank field widgets use embedded Helvetica for basic editable-field
appearances. Stage 05 must embed a Unicode-capable font when completed PDFs
contain characters Helvetica cannot encode; it must fail explicitly rather
than silently dropping text.
