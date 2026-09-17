# Stage 07 — Lightweight web application

**Status:** completed

**Dependencies:** Stage 03 for UI; Stage 05 for PDF download

## Deliverable

Responsive HTML character generation/customization with client-side PDF download.

## Tasks

- [x] Add random/selected-background generation and structured HTML results.
- [x] Add identity, traits, faction, spell choices, and optional attribute swap.
- [x] Show inventory occupancy, armor restrictions, and starting companions.
- [x] Preserve generated state while editing/exporting; recompute dependent values.
- [x] Add browser template/font loading, download, progress, and error handling.
- [x] Ensure accessible labels, keyboard flow, safe text insertion, and mobile layout.
- [x] Verify production asset paths under both root and nested project base.
- [x] Run browser integration checks for generation, customization, and actual download.

## Completion gate

Displayed actor and downloaded PDF agree. No backend or external runtime service
is required. All confirmed basic customization works without unrelated rerolls.

## Verification evidence

| Check/command | Result |
| --- | --- |
| `npm run typecheck` | passed |
| `npm test` | passed: 9 files, 75 tests, including jsdom browser integration |
| `npm run build` | passed |
| `git diff --check` | passed |
| Browser integration test | passed: selected Knight generation, identity edit, swap, companion template selection, and download callback |
| Production asset paths | passed: built HTML uses `./assets/` paths and bundles character, retainer, and mount PDF assets |
| Production bundle warning | recorded: the JavaScript bundle is approximately 505 kB because it includes `pdf-lib`; code splitting is a future optimization |

## Partial-work checkpoint

Completed. Next: Stage 08 can configure delivery and remove superseded legacy
integration after reviewing its scope and deployment prerequisites.

## Follow-up refinements

After completion, the browser page title was expanded to `Chaos & Conquest
Character Generator`; the generation action was separated from background
selection; the default palette became dark; panel shadows and overlapping focus
styles were removed. Squires now receive generated human names with recorded
name choices. See the [follow-up handoff](../handoffs/2026-09-13-stage-07-follow-up.md).
