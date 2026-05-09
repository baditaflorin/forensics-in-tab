# Phase 3 Codebase Health Audit

Audit date: 2026-05-09

This audit is measurement only. No code changes were made before writing it.

## DRY Violations

1. Empty-panel states are repeated in:
   - `src/features/disk/DiskPanel.tsx`
   - `src/features/memory/MemoryPanel.tsx`
   - `src/features/yara/YaraPanel.tsx`
   - `src/features/disasm/DisasmPanel.tsx`
   - `src/features/report/ReportPanel.tsx`
2. Download/export mechanics are local-only and one-off in:
   - `src/features/report/ReportPanel.tsx`
3. Evidence lifecycle state is concentrated in `src/App.tsx`, where loading, resets of downstream state, and tab routing all happen together.

## SOLID / Responsibility Issues

1. `src/App.tsx` owns too many concerns:
   - evidence loading
   - active evidence selection
   - analysis orchestration
   - tab navigation
   - error handling
   - report composition wiring
2. `src/features/evidence/EvidenceIntake.tsx` is a UI component but also encodes intake workflow policy.
3. `src/features/disasm/DisasmPanel.tsx` performs parsing, validation, async orchestration, and rendering in one component.

## Dead Code / Dormant Paths

- No obviously abandoned source files were found in `src/`.
- No `TODO`, `FIXME`, `XXX`, or `HACK` markers were found in authored source.

## Type-Safety Holes

1. Unsafe cast in `src/features/disasm/DisasmPanel.tsx` when reading the architecture select value.
2. Unsafe `ArrayBuffer` cast in `src/features/evidence/evidence.ts` when hashing copied bytes.
3. No schema boundary exists for imported persisted state because persisted state does not exist yet.

## Inconsistent Patterns

1. Some panels use inline empty states while `DiskPanel` has a local `EmptyPanel` helper.
2. Export logic lives inside the report panel instead of a shared action layer.
3. Input validation varies between engines:
   - YARA rules are parsed with explicit errors.
   - Disassembly numeric parameters are passed through `Number(...)` with no user-facing validation.

## Test Coverage Holes

1. No tests cover user-owned input paths beyond file upload in the smoke test.
2. No tests cover persistence because it does not exist.
3. No tests cover export round-trips.
4. No tests cover documentation claims against UI behavior.

## Counts

- DRY issues called out: 3 clusters
- SOLID issues called out: 3
- TODO/FIXME/XXX/HACK markers: 0
- Explicit `any` in authored app source: 0
- `@ts-ignore` markers in authored app source: 0

The codebase is pleasantly small, but the state and workflow logic have not yet been given a durable home. That is the main source of Phase 3 friction.
