# Phase 3 Feature Claims Audit

Audit date: 2026-05-09

Legend:

- `green` = shipped fully
- `yellow` = shipped partially
- `red` = not shipped

| Claim                                     | Status | Source                          | Reality                                                                            |
| ----------------------------------------- | ------ | ------------------------------- | ---------------------------------------------------------------------------------- |
| Evidence stays local in the browser       | green  | `README.md`, app UI             | Mode A static app; no runtime backend.                                             |
| Disk image triage with file recovery      | yellow | `README.md`, UI copy            | Signature carving and MBR parsing exist, but no batch handling or artifact export. |
| Memory analysis                           | yellow | `README.md`, UI copy            | IOC and PE hint analysis exists, but no saved workflow or export paths.            |
| YARA scanning                             | yellow | `README.md`, UI copy            | Local subset scanner works, but rules and matches are not portable.                |
| Disassembly                               | yellow | `README.md`, UI copy            | Works, but with thin validation and no export/copy path.                           |
| Local report export                       | yellow | `README.md`, UI copy            | JSON export exists, but not a restorable state format.                             |
| Live Pages URL is usable as the product   | yellow | README positioning              | Loads and demos correctly, but stranger usability is still narrow.                 |
| Privacy docs explain collection           | green  | `docs/privacy.md`               | Honest: no analytics, no uploads.                                                  |
| Architecture docs reflect Pages-only mode | green  | ADRs and `docs/architecture.md` | Matches implementation.                                                            |

Summary:

- Green: 4
- Yellow: 5
- Red: 0

The main mismatch is not fabricated marketing; it is that product copy reads like an investigator can work end-to-end, while the current implementation still behaves like a single-session demo.
