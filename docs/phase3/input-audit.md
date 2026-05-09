# Phase 3 Input Pathway Audit

Audit date: 2026-05-09

Legend:

- `green` = works fully on real data
- `yellow` = works partially
- `adr` = intentionally out of scope and documented by ADR

| Pathway                            | Status | Evidence                                                                        | Notes                                                                               |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Single file picker                 | green  | `src/features/evidence/EvidenceIntake.tsx`                                      | Still works and now feeds the same queue as every other intake path.                |
| Drag and drop                      | green  | `src/features/evidence/EvidenceIntake.tsx`                                      | Supports multi-file drop and hands all files to the loader.                         |
| Multi-file upload                  | green  | `src/features/evidence/EvidenceIntake.tsx`                                      | The picker is `multiple` and the queue retains all items.                           |
| Folder upload                      | adr    | `docs/adr/0061-input-pathway-coverage-policy.md`                                | Recursive folder intake stays out of scope for Mode A.                              |
| Paste text                         | green  | `src/features/evidence/EvidenceIntake.tsx`, `src/features/evidence/evidence.ts` | Text paste becomes a first-class intake path.                                       |
| Paste hex/base64                   | green  | `src/features/evidence/EvidenceIntake.tsx`, `src/features/evidence/evidence.ts` | Hex and base64 are parsed explicitly with validation.                               |
| Clipboard read API                 | adr    | `docs/adr/0061-input-pathway-coverage-policy.md`                                | Paste is supported; background clipboard reads remain intentionally unimplemented.  |
| URL import                         | adr    | `README.md`, `docs/adr/0061-input-pathway-coverage-policy.md`                   | Remote fetch intake is deliberately excluded in static Mode A.                      |
| Mobile file picker                 | green  | Native picker plus shared intake UI                                             | Uses the browser-native picker and the same queue workflow.                         |
| Sample/demo evidence               | green  | `src/features/evidence/EvidenceIntake.tsx`, `src/app/useForensicsSession.ts`    | Sample evidence is a first-class entry point.                                       |
| Restored autosave/session recovery | green  | `src/app/persistence.ts`, `src/app/useForensicsSession.ts`                      | Browser-local IndexedDB restores the previous case when enabled.                    |
| Imported saved state               | green  | `src/features/evidence/EvidenceIntake.tsx`, `src/app/useForensicsSession.ts`    | Session JSON imports restore the saved workspace.                                   |
| Deep link / shared session load    | green  | `src/app/share.ts`, `src/app/useForensicsSession.ts`                            | Small shared sessions load from the URL hash on open.                               |
| Type detection on intake           | green  | `src/features/evidence/evidence.ts`                                             | Intake detects disk, memory, text, and generic binary cases.                        |
| Wrong-guess override               | green  | `src/features/evidence/EvidenceIntake.tsx`                                      | Each queue item exposes a one-click `Treat as` override.                            |
| Start fresh / clear evidence       | green  | `src/features/evidence/EvidenceIntake.tsx`, `src/app/useForensicsSession.ts`    | `Start Fresh` clears evidence and saved session state.                              |
| Batch progress and per-file errors | yellow | `src/app/useForensicsSession.ts`                                                | Multi-file errors are surfaced per file, but there is no per-file progress bar yet. |

Summary:

- Green: 13
- Yellow: 1
- ADR: 3

The intake surface is now broad enough for real user data: files, multiple files, paste, sample, saved sessions, and shared sessions all converge into one case queue. The only remaining yellow item is progress granularity during bulk loads.
