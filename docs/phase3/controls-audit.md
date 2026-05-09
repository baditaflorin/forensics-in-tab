# Phase 3 Controls Audit

Audit date: 2026-05-09

Legend:

- `green` = control works end-to-end on real data
- `yellow` = works partially or with hidden caveats
- `red` = stub, misleading, or missing required follow-through

| Control               | Status | Evidence                                   | Notes                                                                         |
| --------------------- | ------ | ------------------------------------------ | ----------------------------------------------------------------------------- |
| `Choose Evidence`     | yellow | `src/features/evidence/EvidenceIntake.tsx` | Loads one file, but the label does not signal the single-file limitation.     |
| Drag-drop intake area | yellow | `src/features/evidence/EvidenceIntake.tsx` | Accepts only the first dropped file.                                          |
| Tabs                  | green  | `src/ui/Tabs.tsx`                          | Navigation works.                                                             |
| `Run Rules`           | green  | `src/features/yara/YaraPanel.tsx`          | Runs against loaded bytes and returns matches.                                |
| YARA rules editor     | green  | `src/features/yara/YaraPanel.tsx`          | Editable and used by the scan.                                                |
| `Disassemble`         | yellow | `src/features/disasm/DisasmPanel.tsx`      | Runs, but numeric inputs are weakly validated and not persisted.              |
| Architecture selector | yellow | `src/features/disasm/DisasmPanel.tsx`      | Works, but relies on an unsafe cast and no validation feedback.               |
| `Export JSON`         | yellow | `src/features/report/ReportPanel.tsx`      | Downloads current report but does not support re-import or alternate formats. |
| GitHub link           | green  | `src/ui/Header.tsx`                        | Opens the repository.                                                         |
| PayPal link           | green  | `src/ui/Header.tsx`                        | Opens the support link.                                                       |

Summary:

- Green: 5
- Yellow: 5
- Red: 0

There are no obvious stub buttons in production, but several controls over-promise by implying complete workflows when only the happy path exists.
