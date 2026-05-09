# Phase 3 Feature Claims Audit

Audit date: 2026-05-09

Legend:

- `green` = shipped fully
- `yellow` = shipped partially
- `red` = not shipped

| Claim                                     | Status | Source                          | Reality                                                                                        |
| ----------------------------------------- | ------ | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Evidence stays local in the browser       | green  | `README.md`, app UI             | Mode A static app; no runtime backend.                                                         |
| Disk image triage with file recovery      | green  | `README.md`, UI copy            | Signature carving, partition triage, and artifact CSV export ship on the active evidence item. |
| Memory analysis                           | green  | `README.md`, UI copy            | IOC, PE hint, and process hint triage ships with CSV export and saved sessions.                |
| YARA scanning                             | green  | `README.md`, UI copy            | Local subset scanner ships with reusable rules, saved sessions, and CSV export.                |
| Disassembly                               | green  | `README.md`, UI copy            | Disassembly ships with validated settings, persisted controls, and CSV export.                 |
| Local report export                       | green  | `README.md`, UI copy            | JSON report export, copy, print, and restorable session export are all wired.                  |
| Live Pages URL is usable as the product   | green  | README positioning              | The stranger workflow now covers intake, persistence, export, and restore.                     |
| Privacy docs explain collection           | green  | `docs/privacy.md`               | Honest: no analytics, no uploads.                                                              |
| Architecture docs reflect Pages-only mode | green  | ADRs and `docs/architecture.md` | Matches implementation.                                                                        |

Summary:

- Green: 9
- Yellow: 0
- Red: 0

The main documentation gap is now around limits, not missing workflows. Product copy and shipped behavior are finally speaking the same language.
