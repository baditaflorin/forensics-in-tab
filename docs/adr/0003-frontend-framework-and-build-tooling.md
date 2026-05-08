# 0003 - Frontend Framework and Build Tooling

## Status

Accepted

## Context

The app needs a rich in-browser tool surface, strict typing, Pages output, and fast local checks.

## Decision

Use React 19, TypeScript strict mode, Vite, Tailwind CSS, TanStack Query, Vitest, ESLint, Prettier, and Playwright.

## Consequences

The stack is familiar, production-ready, and fast enough for local hooks. Vite builds directly into `docs/` for GitHub Pages.

## Alternatives Considered

Plain JavaScript was rejected because parser and analyzer code benefits from strict types. Next.js was rejected because static export adds unnecessary framework weight for this app.
