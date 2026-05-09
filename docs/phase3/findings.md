# Phase 3 Findings Synthesis

Audit date: 2026-05-09

## Top 5 Usability Gaps

1. A stranger can only analyze one file at a time and cannot build a case queue.
2. Work disappears on refresh because there is no autosave, restore, or exportable workspace.
3. Output is bottlenecked through one JSON download path, with no copy, CSV, print, or restorable session export.
4. Intake is file-picker-centric; there is no paste path, sample path, or format override for ambiguous inputs.
5. Settings do not exist, so the app cannot make persistence, intake, or output behaviors explicit.

## Top 5 Half-Baked Features

1. Report export: finish
2. Evidence intake: finish
3. Disassembly controls: finish
4. “Use your own data” workflow: finish
5. Demo/sample workflow: add as a first-class complement to real data

No production UI feature is a pure stub, so Phase 3 should finish workflows instead of hiding the visible surface.

## Top 5 Codebase Pain Points

1. `src/App.tsx` is acting as the application layer and store at the same time.
2. Repeated empty-state and action patterns make each new workflow more expensive.
3. Input and output behaviors have no schema-backed session model.
4. Validation conventions differ across features.
5. Tests focus on engines more than real-user session flow.

## Top 5 Documentation / Reality Mismatches

1. README positioning suggests a reusable investigator workflow, but the app behaves like a one-shot session.
2. “Report export” sounds complete, but the exported report cannot be re-imported.
3. The UI implies evidence intake is flexible, but only one dropped file is honored.
4. Disassembly looks production-ready, but invalid numeric input is not explained clearly.
5. No docs explain current operational limits around the 64 MiB sample cap inside the app itself.

## Fully Usable Definition for This Project

Phase 3 is successful when these user stories are true:

1. An investigator can bring one or more of their own files, or paste bytes/text, and the app will classify and load them without guesswork.
2. The investigator can leave and return later without losing the case queue, settings, or analysis state.
3. The investigator can export findings in at least one machine-readable format and one human-friendly format, then re-import the saved session later.
4. The investigator can understand what the app did, what it did not do, and what evidence sample was actually analyzed.

## Phase 3 Success Metrics

1. Every input audit row is `green` or explicitly out of scope in an ADR.
2. Every output audit row is `green` or explicitly out of scope in an ADR.
3. At least 20 completeness improvements land in product code or docs-backed cuts.
4. A stranger-test pass in a private browsing context completes the core workflow without dead ends after top-3 fixes.
5. `make lint`, `make test`, `make build`, and `make smoke` all pass on the release candidate.

## Scope Guardrails

- No architecture escalation beyond Mode A.
- No backend.
- No cosmetic-only work.
- No new analysis engines; only complete the existing user workflow around them.
