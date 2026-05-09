# 0061 - Input Pathway Coverage Policy

## Status

Accepted

## Context

Investigators arrive with evidence in different forms: files, multiple files, copied bytes, or a need to resume earlier work.

## Decision

Phase 3 will support first-class intake through multi-file picker, drag-drop, sample evidence, pasted text and bytes, saved-session import, and shared-session hash import. Unsupported network-based intake remains out of scope in Mode A.

## Consequences

The intake surface becomes broader but still honest about browser-only limits. URL fetches and remote evidence pulls stay out of v1 because they are brittle under CORS and would suggest a remote acquisition workflow the app does not provide.

## Alternatives Considered

Keeping only the file picker was rejected because it leaves too many users without a practical first step.
