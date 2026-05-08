# Postmortem

Date: 2026-05-08

Repository: https://github.com/baditaflorin/forensics-in-tab

Live site: https://baditaflorin.github.io/forensics-in-tab/

## What Was Built

Forensics in Tab v0.1.0 is a pure GitHub Pages forensic triage app. It ships local evidence intake, SHA-256 metadata, MBR partition parsing, signature-based file carving, memory strings and IOC extraction, PE/MZ hints, entropy hotspots, a local YARA-compatible subset scanner, Capstone WASM disassembly with an x86 fallback decoder, JSON report export, a PWA shell, local hooks, ADRs, smoke tests, and deployment documentation.

The published UI includes:

- Repository link: https://github.com/baditaflorin/forensics-in-tab
- PayPal link: https://www.paypal.com/paypalme/florinbadita
- Version and source commit from `build-info.json`

## Was Mode A Correct?

Yes. Mode A was the right choice. The privacy requirement is the product: evidence should not touch a SaaS backend. The shipped v1 can run from static assets and process evidence with browser APIs, TypeScript analyzers, and lazy WASM-capable disassembly.

Mode B is still unnecessary because there is no shared public dataset. Mode C would be actively worse for v1 because it would introduce evidence upload risk, server hardening work, and operational state without solving the core local triage workflow.

## What Worked

Vite building directly into `docs/` worked well for GitHub Pages. The feature folder structure kept disk, memory, YARA, disassembly, and report logic testable. Playwright smoke coverage caught local Pages base-path mistakes before release.

## What Did Not Work

Serving `docs/` with a generic static server did not mimic the `/forensics-in-tab/` Pages base path. A small preview server was needed. Generated `build-info.json` also needed special handling so verification builds would not dirty the worktree.

## Surprises

`capstone-wasm` includes TypeScript declarations, but its package export map prevents TypeScript from resolving them cleanly, so a local declaration shim was required. The package also causes Vite to warn about an externalized Node `module` import, but the browser build succeeds and the WASM asset is lazy-loaded.

## Accepted Tech Debt

The disk and memory workflows are v1 triage analyzers, not full Sleuth Kit or Volatility parity. The YARA engine supports a practical subset rather than full libyara semantics. Evidence is sampled to 64 MiB in v1 to keep browser memory behavior predictable.

## Next Improvements

1. Add OPFS-backed case workspaces with explicit create/delete lifecycle controls for larger evidence.
2. Replace the YARA subset path with a hardened libyara WASM adapter once the wrapper API is stable and documented enough.
3. Add deeper file system parsers for FAT, NTFS, EXT, and APFS behind the existing disk feature boundary.

## Time

Estimate: 2 hours for a static v1 scaffold plus working forensic triage flows.

Actual: about 2 hours, including repository creation, Pages setup, feature implementation, tests, hook hardening, live verification, and documentation.
