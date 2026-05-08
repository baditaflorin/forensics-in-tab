# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live Pages URL is a first-class deliverable from commit one.

## Decision

Publish from `main` branch `/docs`. Vite builds hashed assets into `docs/assets`, preserves documentation in `docs/`, and uses base path `/forensics-in-tab/`. A `404.html` file redirects deep links back to the app.

## Consequences

Built frontend files are committed. `dist/` remains gitignored, but `docs/` is not. Rollback is a normal git revert of the publishing commit.

## Alternatives Considered

A `gh-pages` branch was rejected to keep source and published output visible in one branch. Publishing from repository root was rejected because docs and source files should not all be web-served.
