# Staged work packages

Each numbered document is a reviewable delivery unit, not necessarily one session
or one commit. Split checklist items into smaller tasks as needed. Keep status
and evidence current without changing agreed requirements silently.

Dependency outline:

```text
01 → 02 → 03 → 05 → 06
 └────────04 ↗   └→ 07
03 ─────────────────↗
01–07 → 08
```

Template preparation can progress after foundation tooling while data/core work
continues, provided coordination is explicitly authorized. Web display can be
built after the core; PDF download needs rendering. No stage requires delegating
work to subagents.

| Stage | Deliverable |
| --- | --- |
| [01](01-foundation.md) | Reproducible tooling and shared contracts |
| [02](02-rules-data.md) | Audited rules datasets with provenance |
| [03](03-generation.md) | Pure, tested generation and customization |
| [04](04-pdf-templates.md) | Three reproducible, visually checked fillable templates |
| [05](05-pdf-rendering.md) | Complete character/companion PDF export |
| [06](06-cli.md) | Validated PDF-only CLI |
| [07](07-web.md) | Accessible lightweight generation/customization UI |
| [08](08-delivery.md) | Static deployment configuration, cleanup, final verification |

Use [the stage template](../templates/stage.md) for additional work packages.
