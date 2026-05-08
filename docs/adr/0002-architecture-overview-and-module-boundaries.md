# 0002 - Architecture Overview and Module Boundaries

## Status

Accepted

## Context

The app needs multiple forensic workflows while staying static and understandable.

## Decision

Use feature folders under `src/features`: evidence intake, disk recovery, memory analysis, YARA matching, disassembly, and report export. Shared byte utilities live in `src/lib`. UI state remains in React components.

## Consequences

Each workflow can be tested independently. Shared parsing helpers stay small and reusable. The browser is the only execution boundary in v1.

## Alternatives Considered

A monolithic analyzer module was rejected because it would make testing and future WASM swaps harder.
