# 0009 - Configuration and Secrets Management

## Status

Accepted

## Context

The frontend must not contain secrets. Mode A should need none.

## Decision

Use only public build-time constants and `build-info.json`. `.env.example` documents public URLs. `.env*`, private keys, and certificates are gitignored. Gitleaks runs in the local pre-commit hook.

## Consequences

There is no secret rotation process in v1 because no secrets are used.

## Alternatives Considered

Encrypted frontend secrets were rejected; frontend secrets are still public to users.
