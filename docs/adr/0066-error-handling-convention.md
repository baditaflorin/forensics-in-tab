# 0066 - Error Handling Convention

## Status

Accepted

## Context

Completeness work introduces more boundary conditions: invalid pasted bytes, malformed saved sessions, and unsupported share hashes.

## Decision

Boundary code will validate and return typed user-facing errors. Panels will show recovery guidance inline, while analysis modules continue returning typed warnings where work can proceed.

## Consequences

Users get visible explanations instead of silent resets or partially updated state.

## Alternatives Considered

Global toast-only errors were rejected because many failures are local to a specific workflow and should stay anchored there.
