# 0069 - Type-Safety Policy At Boundaries

## Status

Accepted

## Context

The new boundaries in Phase 3 are not analyzers; they are user-controlled inputs and persisted state.

## Decision

All external boundaries must validate with Zod:

- build metadata fetch
- pasted/imported session content
- share-hash payloads
- persisted local session records

Unsafe casts are removed except where unavoidable inside well-contained browser APIs.

## Consequences

A malformed import becomes a recoverable validation error instead of a broken application state.

## Alternatives Considered

Trusting JSON shape from local files and URL hashes was rejected because those are untrusted inputs.
