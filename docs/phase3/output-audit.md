# Phase 3 Output Pathway Audit

Audit date: 2026-05-09

Legend:

- `green` = works fully on real data
- `yellow` = works partially
- `adr` = intentionally out of scope and documented by ADR

| Pathway                         | Status | Evidence                                                                                                                                           | Notes                                                                    |
| ------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| JSON report download            | green  | `src/features/report/ReportPanel.tsx`                                                                                                              | Exported from the report panel with current build and evidence metadata. |
| CSV export                      | green  | `src/features/disk/DiskPanel.tsx`, `src/features/memory/MemoryPanel.tsx`, `src/features/yara/YaraPanel.tsx`, `src/features/disasm/DisasmPanel.tsx` | Each analysis panel exposes a CSV export path.                           |
| Copy report to clipboard        | green  | `src/features/report/ReportPanel.tsx`, `src/lib/export.ts`                                                                                         | Report JSON copies to the clipboard with confirmation.                   |
| Save full session/state file    | green  | `src/features/report/ReportPanel.tsx`, `src/app/session.ts`                                                                                        | Restorable session JSON exports from the report panel.                   |
| Import saved session/state file | green  | `src/features/evidence/EvidenceIntake.tsx`, `src/app/useForensicsSession.ts`                                                                       | Session files rehydrate the workspace.                                   |
| Shareable URL                   | green  | `src/features/report/ReportPanel.tsx`, `src/app/share.ts`                                                                                          | Small sessions can be copied as a URL hash; large ones fail clearly.     |
| Print/PDF-friendly view         | green  | `src/features/report/ReportPanel.tsx`, `src/App.tsx`, `src/styles.css`                                                                             | Report printing hides intake chrome and uses the browser print flow.     |
| Screenshot/export image         | adr    | `docs/adr/0062-output-pathway-coverage-policy.md`                                                                                                  | Image export is not part of the current workflow contract.               |
| API/automation-ready snippets   | adr    | `docs/adr/0062-output-pathway-coverage-policy.md`                                                                                                  | Explicit code snippets stay out of Phase 3 scope.                        |
| Copy individual findings        | yellow | Panel-level CSV export exists, but there is no one-click copy action on every individual row yet.                                                  |
| Export YARA matches             | green  | `src/features/yara/YaraPanel.tsx`                                                                                                                  | CSV export covers rules, match flags, offsets, and samples.              |
| Export disassembly              | green  | `src/features/disasm/DisasmPanel.tsx`                                                                                                              | CSV export covers instruction rows.                                      |

Summary:

- Green: 9
- Yellow: 1
- ADR: 2

The app now has real exit paths: report JSON, restorable sessions, CSVs, clipboard copy, share hashes, and print. The remaining yellow item is finer-grained copy affordances on individual findings.
