# Phase 3 Input Pathway Audit

Audit date: 2026-05-09

Legend:

- `green` = works fully on real data
- `yellow` = works partially
- `red` = claimed but broken or not built

| Pathway                            | Status | Evidence                                      | Notes                                                                          |
| ---------------------------------- | ------ | --------------------------------------------- | ------------------------------------------------------------------------------ |
| Single file picker                 | yellow | `src/features/evidence/EvidenceIntake.tsx`    | One file only; no format hints, no queue, no reset path.                       |
| Drag and drop                      | yellow | `src/features/evidence/EvidenceIntake.tsx`    | Drop reads only the first file and silently ignores the rest.                  |
| Multi-file upload                  | red    | `src/features/evidence/EvidenceIntake.tsx`    | Not implemented.                                                               |
| Folder upload                      | red    | `src/features/evidence/EvidenceIntake.tsx`    | Not implemented.                                                               |
| Paste text                         | red    | `src/features/evidence/EvidenceIntake.tsx`    | Not implemented.                                                               |
| Paste hex/base64                   | red    | `src/features/evidence/EvidenceIntake.tsx`    | Not implemented.                                                               |
| Clipboard read API                 | red    | `src/` search for `clipboard`                 | Not implemented.                                                               |
| URL import                         | red    | `src/`                                        | Not implemented.                                                               |
| Mobile file picker                 | yellow | Native `<input type="file">` only             | Browser-native picker exists, but no UX guidance and no multi-source handling. |
| Sample/demo evidence               | red    | README + app UI                               | No sample loader is exposed.                                                   |
| Restored autosave/session recovery | red    | `src/` search for `localStorage`, `indexedDB` | No persistence path exists.                                                    |
| Imported saved state               | red    | `src/`                                        | Not implemented.                                                               |
| Deep link / shared session load    | red    | `src/` search for `location.hash`             | Not implemented.                                                               |
| Type detection on intake           | yellow | `src/features/evidence/evidence.ts`           | MIME and name are stored, but no routing or override is offered.               |
| Wrong-guess override               | red    | `src/`                                        | Not implemented.                                                               |
| Start fresh / clear evidence       | red    | UI audit                                      | Not implemented.                                                               |
| Batch progress and per-file errors | red    | `src/`                                        | Not implemented.                                                               |

Summary:

- Green: 0
- Yellow: 4
- Red: 13

The current intake is enough for a demo but not for a stranger bringing their own case files. The biggest gaps are multi-input support, persistence, and alternate input routes when a file picker is not the easiest path.
