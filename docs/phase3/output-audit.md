# Phase 3 Output Pathway Audit

Audit date: 2026-05-09

Legend:

- `green` = works fully on real data
- `yellow` = works partially
- `red` = claimed but broken or not built

| Pathway                         | Status | Evidence                              | Notes                                                                     |
| ------------------------------- | ------ | ------------------------------------- | ------------------------------------------------------------------------- |
| JSON report download            | yellow | `src/features/report/ReportPanel.tsx` | Works, but only for the current in-memory case and cannot be re-imported. |
| CSV export                      | red    | `src/`                                | Not implemented.                                                          |
| Copy report to clipboard        | red    | `src/` search for `clipboard`         | Not implemented.                                                          |
| Save full session/state file    | red    | `src/`                                | Not implemented.                                                          |
| Import saved session/state file | red    | `src/`                                | Not implemented.                                                          |
| Shareable URL                   | red    | `src/` search for `hashchange`        | Not implemented.                                                          |
| Print/PDF-friendly view         | red    | `src/` search for `print(`            | Not implemented.                                                          |
| Screenshot/export image         | red    | `src/`                                | Not implemented.                                                          |
| API/automation-ready snippets   | red    | `src/`                                | Not implemented.                                                          |
| Copy individual findings        | red    | `src/`                                | Not implemented.                                                          |
| Export YARA matches             | red    | `src/`                                | Not implemented.                                                          |
| Export disassembly              | red    | `src/`                                | Not implemented.                                                          |

Summary:

- Green: 0
- Yellow: 1
- Red: 11

The app can produce a JSON report, but users cannot reliably take their work out in the format most useful for the next tool or bring it back in later.
