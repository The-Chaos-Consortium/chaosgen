# Stage 05 — PDF rendering and assembly

**Status:** in_progress

**Dependencies:** Stages 03 and 04

## Deliverable

Shared byte-in/byte-out PDF export of a character and all granted companions.

## Tasks

- [x] Map character values, both current/max statistics, traits, talents, and spells.
- [x] Lay out item text in each occupied slot, trivial items, long text, and continuation content.
- [x] Route squire/pets to retainer panels and every mount to the mount sheet.
- [x] Put squire talents and pet morale in correctly labeled notes.
- [x] Record mount capacities and abilities without inventing unsupported fields.
- [x] Generate appearances, preserve editable fields, then merge in defined order.
- [x] Handle fonts, custom wording, and unsupported-character errors explicitly.
- [ ] Visually inspect required samples after structural export of all backgrounds.

## Completion gate

Readable, complete PDFs match the generated actor. Knight has character, squire,
and dedicated mount output. Exporting cannot reroll, mutate, or silently truncate.

## Verification evidence

| Command | Result |
| --- | --- |
| `npm test` | passed - 7 test files; 70 tests passed, including all-background structural exports and renderer non-mutation checks. |
| `npm run typecheck` | passed |
| `npm run build` | passed |
| `git diff --check` | passed |
| `npm run generate:pdf-review-samples` | passed - wrote six synthetic PDFs under ignored `output/pdf-review/`. |
| Editable field regression checks | passed - Knight output has 184 fields, transparent widgets, singular per-slot item text, and score-only loyalty; Warpriest labels the Holy Symbol as trivial. |
| Visual PDF review | pending - required samples are generated but have not yet been opened and inspected. |

Record visual review of Knight, Roadwarden, Witch, Warpriest, Duelist, and long
synthetic content separately before completing the stage.

## Partial-work checkpoint

Implemented `src/pdf/rendering.ts`: supplied template bytes are filled,
appearance-generated, and merged with editable transparent fields without
changing the actor or input bytes. The next concrete deliverable is visual
review of generated required samples, followed by any field-fit corrections it
identifies.
