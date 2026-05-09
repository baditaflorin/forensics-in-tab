# Phase 3 Picklist

Derived on 2026-05-09 from the completeness audits.

## Selected Enhancements

1. Add a session model with schema validation.
2. Support multiple evidence entries in a case queue.
3. Support file-picker multi-select.
4. Support multi-file drag-drop.
5. Add sample/demo evidence loader.
6. Add paste intake for raw text, hex, and base64.
7. Add format detection and one-click override.
8. Add active-evidence switching from the queue.
9. Add remove-evidence and start-fresh actions.
10. Add autosave to `localStorage`.
11. Add restore-last-session on load.
12. Add persistence settings with a real toggle.
13. Add “remember last active tab” setting with real behavior.
14. Add session export as a documented JSON state file.
15. Add session import from a saved JSON state file.
16. Add report copy-to-clipboard.
17. Add CSV export for disk artifacts.
18. Add CSV export for memory IOCs.
19. Add CSV export for YARA matches.
20. Add CSV export for disassembly instructions.
21. Add print-friendly report action.
22. Add shareable URL hash export for small sessions.
23. Add URL hash session import on load.
24. Add per-panel empty-state consistency.
25. Extract shared export helpers.
26. Extract shared persisted-app-state helpers and migrations.
27. Remove unsafe casts in evidence hashing and disassembly settings.
28. Add real-user path tests for persistence and import/export.
29. Add stranger-test notes and fix top-3 issues.
30. Align README and docs with the shipped workflow and limitations.

## Delivery Order

1. ADRs for completeness policy and state model.
2. Input completeness.
3. Output completeness.
4. State, persistence, and settings.
5. DRY and responsibility cleanup.
6. Tests and stranger pass.
7. Version bump, tag, push, and release.
