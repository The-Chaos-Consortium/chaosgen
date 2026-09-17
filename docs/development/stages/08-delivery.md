# Stage 08 — Deployment, cleanup, and final review

**Status:** completed

**Dependencies:** Stages 01–07

## Deliverable

Verified static deployment artifact, maintained CLI documentation, and completed
legacy migration with publicly safe repository contents.

## Tasks

- [x] Add GitHub Actions checks/build/Pages publication configuration.
- [x] Document GitHub Pages prerequisites and local preview.
- [x] Verify the production artifact at a nested base with all PDF/font assets.
- [x] Remove verified-obsolete Python/Discord code, dependencies, examples, and
  bot Docker configuration after reviewing any user edits.
- [x] Remove unused legacy sheets while preserving all new printable originals.
- [x] Update README, licensing/attribution, ignores, and development commands.
- [x] Complete all-background data/PDF audit and interface smoke checks.
- [x] Review intended public changes for secrets, private data, and generated clutter.
- [x] Record remaining hosting actions accurately; do not claim live deployment
  without actual evidence and owner authorization.

## Completion gate

All plan acceptance criteria have evidence; docs describe working features.
Static hosting readiness and live deployment status are explicitly distinguished.
There are no remaining obsolete integration references in application/runtime docs;
historical migration context in development docs may remain.

## Verification evidence

| Check/command | Result |
| --- | --- |
| `npm run typecheck` | passed |
| `npm test` | passed: 9 files, 75 tests, including browser integration and all-background structural rendering. |
| `npm run build` | passed; the relative-path artifact includes character, retainer, and mount PDF assets with no absolute asset URLs. |
| `npm run chaosgen -- --all --seed stage-08-audit --output-dir output/stage-08-audit` | passed; generated one editable PDF for each of the 20 backgrounds. |
| `git diff --check` | passed |
| Public-change review | passed; tracked legacy runtime files were removed, generated audit PDFs remain ignored, and no secrets or private data are in intended changes. |

Required visual PDF samples were accepted during Stage 05. GitHub Pages is ready
to deploy after the repository owner selects GitHub Actions as the Pages source;
no live deployment was attempted.

## Post-completion review follow-up

A branch review after the initial completion checkpoint found the issues listed
below. They were subsequently resolved and verified in the
[remediation handoff](../handoffs/2026-09-17-stage-08-remediation.md). The earlier
[review handoff](../handoffs/2026-09-13-stage-08-pr-review.md) is retained for the
original findings and verification context.

- [x] Commit the intended removal of the obsolete Discord `.example_env`.
- [x] Preserve rolled quantities for zero-slot inventory in browser and PDF
   output, and correct the Charlatan counterfeit-coin slot classification under
   D11.
- [x] Resolve the queued faction display/export decision and make browser and
   PDF output agree.
- [x] Make generation and customization consume the validated rules document's
   attribute roll, inventory minimum, corruption modifier, starting spell count,
   and retainer loyalty values, or narrow the supported contract explicitly.
- [x] Retain the squire's defined inventory capacity in the generated actor.
- [x] Validate d20 table ordering or select entries by their recorded d20 index.
- [x] Strengthen generated-document validation for original roll IDs, dice,
   ranges, and totals.
- [x] Prevent long names and custom spell wording from being clipped in printable
   PDF appearances.
- [x] Use file-URL-safe path conversion in the PDF template preparation script.
- [x] Preserve keyboard focus during browser edits and prevent character state
   changes from making an in-progress PDF download disagree with the display.
- [x] Announce successful generation to assistive technology and correct the
   button hover contrast failure.
- [x] Update public documentation that still describes the migration as
   incomplete.
- [x] Confirm and document redistribution rights and attribution for the supplied
   printable PDF templates and their published derivatives.
- [x] Pin GitHub Actions to reviewed commit SHAs and add a Pages deployment
   concurrency policy.
- [x] Add regression coverage for each corrected behavior, then repeat the full
   type, test, build, CLI, PDF structural, and required visual checks.

## Quantity and rules-contract checkpoint

The zero-slot PDF rows now retain rolled quantities while slotted rows preserve
their D13 singular-name behavior. The browser exposes each inventory instance's
quantity, and counterfeit silver coins now use their source-backed one-slot
classification. Generation and customization consume the corresponding validated
rules definitions; squire actors retain their declared capacity.

| Check/command | Result |
| --- | --- |
| `npm run typecheck` | passed |
| `npm test` | passed: 9 files, 77 tests, including configured-rules, quantity, and capacity regressions. |
| `git diff --check` | passed |

## D20 and provenance checkpoint

Trait generation now resolves entries by recorded d20 index, so a valid table's
array order cannot change its result. Generated-document envelope validation now
requires the three named attribute-roll IDs, positive integer dice, and totals
equal to their recorded dice. It also parses every additional roll under the
same provenance checks.

| Check/command | Result |
| --- | --- |
| `npm run typecheck` | passed |
| `npm test` | passed: 9 files, 79 tests, including shuffled d20-table and malformed-roll regressions. |
| `npm run build` | passed; Vite emitted the existing JavaScript chunk-size warning. |
| `git diff --check` | passed |

## PDF and browser checkpoint

PDF text fields now use measured Helvetica fitting, reduce their size down to
5pt, and make name fields multiline when required. Text that cannot fit still
fails with a clear error instead of clipping. The template script resolves its
repository root through `fileURLToPath`. Browser refreshes restore the focused
editable control and selection; PDF preparation disables generation and edit
controls until the snapshot finishes.

| Check/command | Result |
| --- | --- |
| `npm run typecheck` | passed |
| `npm test` | passed: 9 files, 81 tests, including PDF fitting, focus, and download-lock regressions. |
| `npm run build` | passed; Vite emitted the existing JavaScript chunk-size warning. |
| `npm run prepare:pdf-templates -- --debug` | passed; created all three synthetic debug forms. |
| `npm run generate:pdf-review-samples` | passed; generated the six synthetic PDF review samples. |
| Visual PDF review | passed: inspected the first page of the long-name/custom-spell sample at 1500px; name wraps in its field and custom wording is visible in the spell panel. |
| `git diff --check` | passed |

## Accessibility checkpoint

Successful generation now updates the polite status region with the generated
name. The generic button hover background is `#963729`, which has approximately
7.3:1 contrast against its white text.

| Check/command | Result |
| --- | --- |
| `npm run typecheck` | passed |
| `npm test` | passed: 9 files, 81 tests, including generation-status coverage. |
| `npm run build` | passed; Vite emitted the existing JavaScript chunk-size warning. |
| `git diff --check` | passed |

## Faction and documentation checkpoint

D15 records the owner ruling to include faction in the character notes field.
The browser continues to display and edit faction, and the completed PDF now
records the selected value in its notes. Public usage and template documentation
now describe the implemented application.

| Check/command | Result |
| --- | --- |
| `npm run typecheck` | passed |
| `npm test` | passed: 9 files, 82 tests, including faction PDF output. |
| `npm run build` | passed; Vite emitted the existing JavaScript chunk-size warning. |
| `git diff --check` | passed |

## Workflow checkpoint

The Pages workflow pins `checkout`, `mise-action`, `upload-pages-artifact`, and
`deploy-pages` to reviewed immutable commits. Its `github-pages` concurrency
group queues closely spaced workflow runs rather than allowing deployments to
overlap.

| Check/command | Result |
| --- | --- |
| `git ls-remote` for each action tag | passed; recorded commit SHAs match the stated major tags. |
| `git diff --check` | passed |

## Final remediation verification

All review-remediation checklist items are complete. The required synthetic
front-page samples for Knight, Roadwarden, Witch, Warpriest, Duelist, and the
long-name/custom-spell case were inspected visually at 1500px. Generated PDFs
remain editable under structural coverage, including all 20 backgrounds.

| Check/command | Result |
| --- | --- |
| `npm run typecheck` | passed |
| `npm test` | passed: 9 files, 82 tests. |
| `npm run build` | passed; Vite emitted the existing JavaScript chunk-size warning. |
| `npm run chaosgen -- --all --seed stage-08-final --output-dir <temporary-directory>` | passed: 20 editable PDFs, one per background. |
| `npm run generate:pdf-review-samples` | passed: six synthetic samples. |
| Visual PDF review | passed: the six required front-page samples were inspected at 1500px. |
| `git diff --check` | passed |

## Completion status

Stage 08 is complete and the branch is ready for review. D17 authorizes public
distribution of the supplied templates and fillable derivatives through this
repository and GitHub Pages. GitHub Pages activation remains an external action:
after review and merge, the owner must select GitHub Actions as the Pages source.
The final [PR-readiness re-review](../handoffs/2026-09-17-pr-readiness-review.md)
verified the remediation again and closed the remaining configured-rank contract
and explicit regression-coverage gaps.
