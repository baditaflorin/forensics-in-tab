# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

Investigators may analyze sensitive files. Persistence must not surprise them.

## Decision

Persist user settings in `localStorage` and persist explicit case sessions in browser-local IndexedDB when the investigator leaves restore enabled. Session exports use the same versioned JSON schema for offline backup and transfer.

## Consequences

Investigators can refresh and resume work locally without introducing a backend. Evidence still stays in the browser, but local persistence must now be explained clearly in the UI and privacy docs.

## Alternatives Considered

Memory-only storage was sufficient for Phase 2, but it prevented a usable “resume later” workflow. OPFS was considered for very large files but deferred until a deliberate case workspace model exists.
