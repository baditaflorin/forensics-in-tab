# 0006 - WASM Modules Used and Why

## Status

Accepted

## Context

The prompt names Sleuth Kit, Volatility, YARA, and Capstone. Browser support varies by project and package maturity.

## Decision

Ship a Capstone WASM dependency for the disassembly adapter and lazy-load it behind user action. Disk, memory, and YARA v1 analyzers are browser-local TypeScript implementations with clear boundaries for future Sleuth Kit, Volatility/Pyodide, and libyara WASM adapters.

## Consequences

V1 is usable immediately and remains static. Full native parity is explicitly outside v1, but module boundaries allow replacing analyzers with WASM-backed implementations later.

## Alternatives Considered

Bundling Pyodide and full Volatility was rejected for v1 because of payload size and browser compatibility risk. Using undocumented libyara bindings directly was deferred to avoid fragile core behavior.
