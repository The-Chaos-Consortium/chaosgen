# Development documentation

This directory preserves the completed staged delivery record for the Chaos &
Conquest web generator and PDF-only CLI. It also contains maintained technical
contracts and owner decisions. The plan, stages, and dated handoffs are historical
records; current setup and usage live in the [project README](../../README.md).

## Start here

1. Read the repository [AGENTS.md](../../AGENTS.md) and this directory's
   [development guidance](AGENTS.md).
2. Read [confirmed decisions](decisions.md) and the maintained
   [technical contracts](contracts.md) for affected behavior.
3. Use [status.md](status.md) for final delivery status and external release work.
4. Consult the [plan](plan.md), [stages](stages/README.md), and
   [handoffs](handoffs/README.md) when historical implementation context matters.

## Structure

| Document/directory | Purpose |
| --- | --- |
| `plan.md` | Historical scope, architecture, requirements, and acceptance criteria |
| `decisions.md` | Confirmed rulings and implemented interpretation boundaries |
| `status.md` | Final implementation status and remaining external release action |
| `contracts.md` | Working npm scripts and durable architecture boundaries |
| `stages/` | Independently reviewable work packages and completion evidence |
| `handoffs/` | Dated checkpoints for interrupted or completed sessions |
| `templates/` | Reusable stage and handoff document templates |
| `AGENTS.md`, `CLAUDE.md` | Development-specific agent guidance |

Keep enduring design decisions in `decisions.md`, current release state in
`status.md`, and checkpoint-specific context in handoffs. Link between documents
rather than copying competing versions of requirements.

User-facing setup and working commands are maintained in the project README.
Historical proposed commands remain in the archived plan only when clearly
identified as planning context.
