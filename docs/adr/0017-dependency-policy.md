# 0017 - Dependency Policy

## Status

Accepted

## Context

The app handles security-sensitive workflows and should avoid fragile dependencies.

## Decision

Use production-ready libraries for the application shell, testing, formatting, and Capstone-backed disassembly. Avoid undocumented forensic packages on critical paths unless wrapped behind a tested adapter and fallback.

## Consequences

Some native-tool parity is deferred, but the shipped v1 is more reliable. `npm audit` must report no high or critical vulnerabilities before release.

## Alternatives Considered

Using every available forensic WASM package directly was rejected because abandoned or undocumented bindings could break core analysis.
