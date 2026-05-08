# 0001 - Deployment Mode

## Status

Accepted

## Context

Forensics in Tab handles disk images, memory dumps, malware rules, and binary snippets. Evidence privacy is the core requirement: evidence should not be uploaded to a SaaS or runtime backend.

## Decision

Use Mode A: Pure GitHub Pages. The app is a static Vite/React site served from `main` `/docs`. Evidence processing runs in the browser with TypeScript analyzers and lazy WASM-capable adapters.

## Consequences

Evidence bytes stay local to the investigator's browser. There is no runtime API, database, auth service, Docker image, nginx config, or server metrics in v1. Browser memory and WebAssembly support limit the largest practical evidence sizes.

## Alternatives Considered

Mode B was rejected because v1 has no shared public dataset to precompute. Mode C was rejected because uploading privacy-critical evidence to a backend contradicts the product goal.
