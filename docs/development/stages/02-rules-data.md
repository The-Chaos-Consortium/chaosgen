# Stage 02 — Rules datasets

**Status:** completed

**Dependencies:** Stage 01 contracts

## Deliverable

Versioned datasets sufficient for all current starting characters and companions.

## Tasks

- [x] Record source revision, section references, and attribution/license metadata.
- [x] Audit all 20 backgrounds and talent triplets in canonical order.
- [x] Normalize item slots, quantities, alternatives, armor, weapons, and effects.
- [x] Import nine d20 traits tables, 36 spells, and four-column wording oracle.
- [x] Import companion templates and loyalty/capacity tables.
- [x] Define deduplicated squire talent pool and name convenience data.
- [x] Resolve/document material inventory and other source ambiguities.
- [x] Validate counts, references, unique IDs, and source-sensitive loadouts.

## Completion gate

Every starting grant is traceable to source or a confirmed decision. No import-time
randomness, placeholders-as-slots, invented scroll effects, or dependency on a
sibling checkout at runtime/build time.

## Verification evidence

| Command | Result |
| --- | --- |
| `npm test` | passed — 4 files, 45 tests |
| `npm run typecheck` | passed |
| `npm run build` | passed — Vite production build completed |
| JSON parse check for all three `data/*.json` files | passed |
| `git diff --check` | passed |

Dataset checks cover 20 canonical backgrounds and talent triplets, 40 unique
talents, 63 starting-item definitions, 180 trait entries, 36 example spells,
four oracle columns/80 entries, five companion templates, seven loyalty bands,
and source-sensitive corrected loadouts.

## Partial-work checkpoint

Completed. See the [completion handoff](../handoffs/2026-09-12-stage-02-completion.md).
Next candidate: Stage 03 generation.
