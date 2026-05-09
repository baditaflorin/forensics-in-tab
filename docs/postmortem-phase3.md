# Phase 3 Postmortem

Date: 2026-05-09

## Audit Grids Before Vs After

- Input audit: `0 green / 4 yellow / 13 red` -> `13 green / 1 yellow / 3 ADR`
- Output audit: `0 green / 1 yellow / 11 red` -> `9 green / 1 yellow / 2 ADR`
- Controls audit: `5 green / 5 yellow / 0 red` -> `18 green / 0 yellow / 0 red`
- Feature claims audit: `4 green / 5 yellow / 0 red` -> `9 green / 0 yellow / 0 red`

## Half-Baked Feature Triage Outcomes

- Finished: evidence intake, because the analyzers were already useful and needed real user pathways.
- Finished: report export, because a one-way JSON dump was too incomplete for real work.
- Finished: disassembly controls, because weak validation made the panel look stronger than it was.
- Finished: reusable case sessions, because refresh-loss made the app feel like a demo.
- Finished: sample workflow, because first-run exploration needed to sit beside real data, not replace it.

## Codebase Health Metrics Before Vs After

- DRY clusters: `3` -> `0` unresolved core clusters
- TODO / FIXME / XXX / HACK markers: `0` -> `0`
- Explicit `any` in authored app source: `0` -> `0`
- `@ts-ignore` markers: `0` -> `0`
- Real-user path tests: `1` Playwright happy path -> `2` Playwright flows plus session and evidence unit coverage

## Stranger-Test Findings And Top-3 Fixes

Findings recorded in `docs/phase3/stranger-test.md`.

Top-3 issues addressed:

1. Share URL failure on larger sessions now surfaces an explicit error and points users to session export.
2. Restored-case behavior now announces itself clearly instead of feeling surprising after reload.
3. Docs now explain IndexedDB-backed restore and its privacy boundaries honestly.

## Documentation-Reality Mismatches Found And Fixed

1. Storage ADRs said evidence was memory-only; they now match the shipped restore flow.
2. Privacy docs said refresh cleared evidence unconditionally; they now describe browser-local restore.
3. README now lists the actual intake, export, and limitations surface instead of underselling or over-claiming it.

## What Surprised Me

The main usability blockers were not in the analyzers. They were in workflow continuity: getting evidence in, preserving the session, and letting users take work back out. Once those paths were real, the existing analysis modules felt much more capable.

## Phase 4 Candidates

1. Per-row copy actions for findings, not just CSV exports.
2. Richer batch progress and failure reporting during larger intake operations.
3. Recursive folder import for lab workflows that already organize artifacts in directories.
4. Stronger browser download assertions for export round-trips.
5. Optional OPFS-backed storage for larger local cases when IndexedDB limits become painful.

## Honest Take

Yes, a stranger can now use the app for their own real work end-to-end on the core workflow: load evidence, analyze it, reload later, and export or restore the case. The remaining “not quite” areas are around convenience at the edges, not dead ends in the main path. Very large sessions still need a saved session file instead of a share URL, and high-volume intake could use better progress feedback.
