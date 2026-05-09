# 0065 - Module Boundaries And Dependency Direction

## Status

Accepted

## Context

`src/App.tsx` currently acts as UI composition, workflow state, and orchestration all at once.

## Decision

Phase 3 will keep dependency direction one-way:

- `ui` renders primitives
- `features` render workflow-specific views
- `lib` owns shared pure helpers
- `app` owns session state, persistence, and routing decisions

Feature panels may depend on `lib` and feature-local modules, but not on each other.

## Consequences

The app gets a clearer application layer without introducing a backend-style architecture.

## Alternatives Considered

Keeping all orchestration in `App.tsx` was rejected because persistence and import/export would make that file a long-term bottleneck.
