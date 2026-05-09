# 0064 - DRY Consolidation Map

## Status

Accepted

## Context

Phase 3 adds more workflow code, which would become brittle if each panel implemented persistence, export, and empty states independently.

## Decision

Consolidate shared concerns into reusable modules:

- session schemas and migrations
- export helpers
- intake parsing helpers
- shared panel shell / empty-state helpers

## Consequences

Feature panels can focus on analysis presentation while shared modules own cross-cutting workflow rules.

## Alternatives Considered

Over-abstracting the analyzers themselves was rejected because the engines are already small and purpose-specific.
