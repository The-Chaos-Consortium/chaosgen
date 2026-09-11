# Stage 05 — PDF rendering and assembly

**Status:** pending

**Dependencies:** Stages 03 and 04

## Deliverable

Shared byte-in/byte-out PDF export of a character and all granted companions.

## Tasks

- [ ] Map character values, both current/max statistics, traits, talents, and spells.
- [ ] Lay out slot occupancy, trivial items, long text, and continuation content.
- [ ] Route squire/pets to retainer panels and every mount to the mount sheet.
- [ ] Put squire talents and pet morale in correctly labeled notes.
- [ ] Record mount capacities and abilities without inventing unsupported fields.
- [ ] Generate appearances, flatten filled sheets, then merge in defined order.
- [ ] Handle fonts, custom wording, and unsupported-character errors explicitly.
- [ ] Export all backgrounds; verify stable data and visually inspect required samples.

## Completion gate

Readable, complete PDFs match the generated actor. Knight has character, squire,
and dedicated mount output. Exporting cannot reroll, mutate, or silently truncate.

## Verification evidence

Not run; implementation pending. Record structural checks and visual review of
Knight, Roadwarden, Witch, Warpriest, Duelist, and long synthetic content separately.

## Partial-work checkpoint

No work started. Next: actor-to-field mappings once core and forms are available.
