# Implementation status

**Current state:** Stage 01 completed.
**Active implementation stage:** None.
**Next candidate:** Stage 02, rules data (do not start without authorization).

| Stage | Status | Dependencies | Evidence / handoff |
| --- | --- | --- | --- |
| [01 Foundation](stages/01-foundation.md) | completed | None | [Completion handoff](handoffs/2026-09-12-stage-01-completion.md) |
| [02 Rules data](stages/02-rules-data.md) | pending | 01 contracts | — |
| [03 Generation](stages/03-generation.md) | pending | 01, 02 | — |
| [04 PDF templates](stages/04-pdf-templates.md) | pending | 01 tooling | — |
| [05 PDF rendering](stages/05-pdf-rendering.md) | pending | 03, 04 | — |
| [06 CLI](stages/06-cli.md) | pending | 03, 05 | — |
| [07 Web](stages/07-web.md) | pending | 03; 05 for download | — |
| [08 Delivery and cleanup](stages/08-delivery.md) | pending | 01–07 | — |

## Blockers and questions

- No implementation blocker has been established yet.
- Consult the [interpretation queue](decisions.md#interpretation-queue) during the
  data audit; resolve material gaps before relying on assumptions.
- GitLab project/publication details will be needed for live deployment, not for
  building and testing the static app locally.

## Updating this dashboard

Use `pending`, `in_progress`, `blocked`, or `completed`. A partial stage remains
`in_progress` (or `blocked`), with exact remaining tasks in its document. Link to
verification evidence and the latest relevant handoff. Do not mark stages complete
on intent, and do not start implementation solely because this file lists a next
candidate.
