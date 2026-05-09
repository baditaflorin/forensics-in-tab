# Phase 3 Stranger Test

Run date: 2026-05-09

Context:

- Fresh browser context via Playwright
- Static Pages preview build
- No saved local state before the run

## Workflow Walked

1. Open the app from the GitHub Pages build.
2. Load the built-in sample evidence.
3. Confirm the queue updates and the app routes into an analysis workflow.
4. Run YARA against the sample.
5. Reload the page and verify the case restores.
6. Open the report panel and inspect export actions.

## Confusions And Friction Observed

1. Large-session sharing could fail without an obvious fallback path.
2. Restored-case behavior needed to be explicit so a fresh user understood why evidence was still present after reload.
3. The old docs still implied refresh always cleared evidence, which would make the new restore flow feel suspicious instead of intentional.

## Top 3 Fixes Applied Before Release

1. Added explicit share-error handling in the report panel with a clear `save session instead` path.
2. Added restore notices and a settings explanation for browser-local case recovery.
3. Updated README, privacy docs, and storage ADRs to explain IndexedDB-backed restore and its limits.

## Result

The stranger workflow now completes without dead ends on the main path: intake, analyze, reload, restore, and export all work in a fresh browser context.

## Remaining Rough Edges

1. Very large sessions still need file export instead of URL sharing.
2. Bulk intake reports failures per file, but not with a richer progress indicator.
3. Individual row copy actions are still less direct than CSV export.
