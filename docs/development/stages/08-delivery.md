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

## Partial-work checkpoint

Completed. The next external action is enabling GitHub Pages with GitHub Actions
in repository settings, then observing the first `main` deployment.
