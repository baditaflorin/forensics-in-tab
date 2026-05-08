# 0008 - Go Backend Project Layout

## Status

Accepted

## Context

The bootstrap template defines Go backend expectations for Modes B and C.

## Decision

Skip Go backend layout in Mode A. There is no `cmd/`, `internal/`, runtime API, Dockerfile, or data generator in v1.

## Consequences

The repository stays focused on the browser app. If a future Mode B generator is added, it will follow `cmd/`, `internal/`, `pkg/`, `api/`, `configs/`, `scripts/`, and `test/`.

## Alternatives Considered

Adding an empty Go skeleton was rejected because unused backend scaffolding would imply a server exists.
