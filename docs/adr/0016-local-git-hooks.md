# 0016 - Local Git Hooks

## Status

Accepted

## Context

The project uses no GitHub Actions. Checks need to run locally.

## Decision

Use plain `.githooks/` scripts wired by `make install-hooks`. Hooks enforce lint/build/gitleaks on pre-commit, Conventional Commits on commit-msg, and test/build/smoke on pre-push.

## Consequences

Contributors must run `make install-hooks` once per clone. Hooks are idempotent and callable through Makefile targets.

## Alternatives Considered

Lefthook was considered but plain scripts were chosen to keep the setup dependency-free.
