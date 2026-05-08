# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

Investigators may analyze sensitive files. Persistence must not surprise them.

## Decision

Keep evidence files in memory only for v1. Persist only lightweight user preferences in `localStorage` if needed later. Do not store evidence in IndexedDB or OPFS until the UI provides explicit case lifecycle controls.

## Consequences

Closing the tab clears evidence. This is safer for v1 and avoids browser storage cleanup ambiguity.

## Alternatives Considered

OPFS was considered for very large files but deferred until a deliberate case workspace model exists.
