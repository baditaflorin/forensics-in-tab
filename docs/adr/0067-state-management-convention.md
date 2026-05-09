# 0067 - State Management Convention

## Status

Accepted

## Context

Phase 3 needs durable state for evidence queues, active tabs, analysis settings, exports, and restore behavior.

## Decision

Use a single validated React state tree for the case session, managed by an application hook and persisted through schema-backed serializers. Derived analyses remain computed from the active evidence rather than being redundantly stored.

## Consequences

The app keeps one source of truth for workflow state while avoiding stale duplicated analysis data.

## Alternatives Considered

Introducing a dedicated state library was rejected because the app remains small enough for typed React hooks and reducers.
