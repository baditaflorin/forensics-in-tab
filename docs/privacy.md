# Privacy

Live site: https://baditaflorin.github.io/forensics-in-tab/

Repository: https://github.com/baditaflorin/forensics-in-tab

## What Is Collected

Nothing in v1. There is no analytics script, beacon, runtime backend, database, or remote log collector.

## Evidence Handling

Evidence files are read with browser File APIs after the investigator selects, drops, pastes, or restores them. The app samples up to 64 MiB per evidence item for local triage.

Evidence is not uploaded by the app. If the investigator leaves “Restore last case on reopen” enabled, the current local case is saved in browser-local IndexedDB so a refresh can restore it later. Turning that setting off clears the autosaved case. Session exports are saved only when the investigator explicitly downloads them.

## Network Requests

The app requests static assets from GitHub Pages, including JavaScript, CSS, WebAssembly, and `build-info.json`. These requests do not contain evidence bytes.

## Future Analytics

Analytics are disabled by default. Any future analytics would require a new ADR, explicit documentation, no PII, and no evidence-derived metadata.
