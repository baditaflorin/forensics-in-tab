# 0068 - Persistence Schema And Migration Policy

## Status

Accepted

## Context

Phase 3 changes the app from an ephemeral demo into a resumable local tool.

## Decision

Persist case sessions in browser-local IndexedDB behind an explicit setting, using a versioned schema and migration function. User settings stay in `localStorage`. Save files use the same schema family as the IndexedDB session record.

## Consequences

Users can safely resume work and import older saved sessions, and schema evolution becomes deliberate instead of accidental.

## Alternatives Considered

Keeping all evidence memory-only was rejected because it prevents the “resume later” workflow Phase 3 requires.
