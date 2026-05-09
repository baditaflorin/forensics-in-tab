# Phase 3 Controls Audit

Audit date: 2026-05-09

Legend:

- `green` = control works end-to-end on real data
- `yellow` = works partially or with hidden caveats
- `red` = stub, misleading, or missing required follow-through

| Control                | Status | Evidence                                                                        | Notes                                                           |
| ---------------------- | ------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `Add Evidence`         | green  | `src/features/evidence/EvidenceIntake.tsx`                                      | Supports multi-file load into the queue.                        |
| Drag-drop intake area  | green  | `src/features/evidence/EvidenceIntake.tsx`                                      | Multi-file drop works and joins the queue.                      |
| `Import Session`       | green  | `src/features/evidence/EvidenceIntake.tsx`                                      | Loads a restorable workspace JSON.                              |
| `Load Sample`          | green  | `src/features/evidence/EvidenceIntake.tsx`, `src/app/useForensicsSession.ts`    | Loads the built-in sample evidence.                             |
| `Start Fresh`          | green  | `src/features/evidence/EvidenceIntake.tsx`, `src/app/useForensicsSession.ts`    | Clears current evidence and saved autosave state.               |
| `Load Pasted Evidence` | green  | `src/features/evidence/EvidenceIntake.tsx`, `src/features/evidence/evidence.ts` | Parses pasted text, hex, or base64.                             |
| Tabs                   | green  | `src/ui/Tabs.tsx`                                                               | Navigation works.                                               |
| `Run Rules`            | green  | `src/features/yara/YaraPanel.tsx`                                               | Runs against the active evidence bytes and returns matches.     |
| YARA rules editor      | green  | `src/features/yara/YaraPanel.tsx`                                               | Editable and used by the scan.                                  |
| `Disassemble`          | green  | `src/features/disasm/DisasmPanel.tsx`                                           | Runs with validated numeric inputs and persisted control state. |
| Architecture selector  | green  | `src/features/disasm/DisasmPanel.tsx`                                           | Uses safe enum parsing and persists across reloads.             |
| `Export JSON`          | green  | `src/features/report/ReportPanel.tsx`                                           | Downloads the active case report.                               |
| `Copy JSON`            | green  | `src/features/report/ReportPanel.tsx`                                           | Copies report JSON with confirmation.                           |
| `Save Session`         | green  | `src/features/report/ReportPanel.tsx`                                           | Exports a restorable session snapshot.                          |
| `Share URL`            | green  | `src/features/report/ReportPanel.tsx`, `src/app/share.ts`                       | Copies a shareable hash URL when the payload is small enough.   |
| `Print`                | green  | `src/features/report/ReportPanel.tsx`, `src/styles.css`                         | Invokes the print view with intake chrome hidden.               |
| GitHub link            | green  | `src/ui/Header.tsx`                                                             | Opens the repository.                                           |
| PayPal link            | green  | `src/ui/Header.tsx`                                                             | Opens the support link.                                         |

Summary:

- Green: 18
- Yellow: 0
- Red: 0

The production controls now do what their labels say on real data. The remaining caveats are size limits and Mode A scope, which are documented explicitly instead of being hidden.
