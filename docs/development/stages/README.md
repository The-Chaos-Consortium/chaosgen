# Staged work packages

The numbered documents are historical records of the reviewable delivery units
used to complete the implementation. They preserve the checklist, dependencies,
and evidence available at each checkpoint.

Dependency outline:

```text
01 → 02 → 03 → 05 → 06
 └────────04 ↗   └→ 07
03 ─────────────────↗
01–07 → 08
```

The dependency model allowed template preparation after foundation tooling while
data/core work continued. Web display followed the core, and PDF download
depended on rendering. These sequencing notes describe the completed delivery,
not active work.

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

Use [the stage template](../templates/stage.md) only when a future change genuinely
needs another staged work package; do not reopen these completed records merely
to track routine maintenance.
