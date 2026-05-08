# 0004 - Static Data Contract

## Status

Accepted

## Context

Mode A has no backend and no scheduled data generation pipeline. The only shipped data is app metadata.

## Decision

Build metadata is emitted to `/build-info.json` during `make build`. Evidence artifacts are user-supplied local files and are never committed, uploaded, or fetched from a service.

## Consequences

The frontend can display version, commit, repository, and support links without a backend. There is no static forensic corpus in v1.

## Alternatives Considered

Committing sample evidence was rejected to avoid normalizing evidence storage in the repo. Release-hosted data was rejected because no shared data is needed.
