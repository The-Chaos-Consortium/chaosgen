# Development documentation

This directory supports incremental development of the Chaos & Conquest web
generator and PDF-only CLI. The project owner approved the overall plan; the
implementation is underway. Foundation tooling and contracts exist, but
character generation and PDF export do not.

## Start here

1. Read [AGENTS.md](AGENTS.md) for development and handoff conventions.
2. Read [the approved plan](plan.md) and [confirmed decisions](decisions.md).
3. Check [status.md](status.md) for the active work package and blockers.
4. Open the relevant [stage](stages/README.md), then inspect the working tree.
5. When stopping, update the stage and status and add a [handoff](handoffs/README.md).

## Structure

| Document/directory | Purpose |
| --- | --- |
| `plan.md` | Scope, architecture, rules requirements, and acceptance criteria |
| `decisions.md` | Confirmed rulings and unresolved interpretations |
| `status.md` | Small, current dashboard of implementation progress |
| `contracts.md` | Working npm scripts and durable Stage 01 downstream boundaries |
| `stages/` | Independently reviewable work packages and completion evidence |
| `handoffs/` | Dated checkpoints for interrupted or completed sessions |
| `templates/` | Reusable stage and handoff document templates |
| `AGENTS.md`, `CLAUDE.md` | Development-specific agent guidance |

Keep enduring design decisions in `decisions.md`, current progress in `status.md`,
and session-specific context in handoffs. Link between documents rather than
copying competing versions of the requirements.

User-facing setup and usage documentation will be added as the corresponding
features become usable. Do not present planned commands as working commands in
the project README before implementation.
