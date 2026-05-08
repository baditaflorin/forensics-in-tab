# 0013 - Testing Strategy

## Status

Accepted

## Context

Parser and matching logic must be reliable enough for triage and safe to change.

## Decision

Use Vitest for colocated unit tests, a separate integration config for future larger browser-independent checks, and Playwright for a static-site smoke path.

## Consequences

`make test`, `make build`, and `make smoke` are fast enough for local hooks.

## Alternatives Considered

GitHub Actions were rejected because the project explicitly uses local hooks instead of CI.
