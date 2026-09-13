# Stage 08 — Deployment, cleanup, and final review

**Status:** in_progress

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

A branch review after the completion checkpoint found unresolved work that must
be addressed before opening the migration PR. The automated checks above still
pass, but they do not cover these findings. See the
[review handoff](../handoffs/2026-09-13-stage-08-pr-review.md) for exact locations
and verification context.

- [x] Commit the intended removal of the obsolete Discord `.example_env`.
- [ ] Preserve rolled quantities for zero-slot inventory in browser and PDF
  output, and correct the Charlatan counterfeit-coin slot classification under
  D11.
- [ ] Resolve the queued faction display/export decision and make browser and
  PDF output agree.
- [ ] Make generation and customization consume the validated rules document's
  attribute roll, inventory minimum, corruption modifier, starting spell count,
  and retainer loyalty values, or narrow the supported contract explicitly.
- [ ] Retain the squire's defined inventory capacity in the generated actor.
- [ ] Validate d20 table ordering or select entries by their recorded d20 index.
- [ ] Strengthen generated-document validation for original roll IDs, dice,
  ranges, and totals.
- [ ] Prevent long names and custom spell wording from being clipped in printable
  PDF appearances.
- [ ] Use file-URL-safe path conversion in the PDF template preparation script.
- [ ] Preserve keyboard focus during browser edits and prevent character state
  changes from making an in-progress PDF download disagree with the display.
- [ ] Announce successful generation to assistive technology and correct the
  button hover contrast failure.
- [ ] Update public documentation that still describes the migration as
  incomplete.
- [ ] Confirm and document redistribution rights and attribution for the supplied
  printable PDF templates and their published derivatives.
- [ ] Pin GitHub Actions to reviewed commit SHAs and add a Pages deployment
  concurrency policy.
- [ ] Add regression coverage for each corrected behavior, then repeat the full
  type, test, build, CLI, PDF structural, and required visual checks.

## Partial-work checkpoint

Reopened after PR review. The next concrete deliverable is the quantity and
rules-contract correction with regression tests; the complete remediation list
is above. GitHub Pages activation remains an external action after the branch is
review-ready and merged.
