# Privacy

Live site: https://baditaflorin.github.io/forensics-in-tab/

Repository: https://github.com/baditaflorin/forensics-in-tab

## What Is Collected

Nothing in v1. There is no analytics script, beacon, runtime backend, database, or remote log collector.

## Evidence Handling

Evidence files are read with browser File APIs after the investigator selects or drops them. The app samples up to 64 MiB for v1 triage and keeps bytes in tab memory.

Evidence is not uploaded by the app. Closing or refreshing the tab clears the in-memory evidence state.

## Network Requests

The app requests static assets from GitHub Pages, including JavaScript, CSS, WebAssembly, and `build-info.json`. These requests do not contain evidence bytes.

## Future Analytics

Analytics are disabled by default. Any future analytics would require a new ADR, explicit documentation, no PII, and no evidence-derived metadata.
