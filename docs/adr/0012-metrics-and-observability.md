# 0012 - Metrics and Observability

## Status

Accepted

## Context

Usage insight is useful, but evidence privacy is more important.

## Decision

Ship no analytics in v1. Observability is limited to local UI status, test output, and browser devtools.

## Consequences

There is no usage dashboard. The privacy story is simple: the app does not beacon usage or evidence metadata.

## Alternatives Considered

Plausible and a Cloudflare Worker beacon were considered but rejected for v1.
