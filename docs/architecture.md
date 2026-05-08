# Architecture

Forensics in Tab is a Mode A GitHub Pages application. The browser is the execution boundary for evidence handling.

Live site: https://baditaflorin.github.io/forensics-in-tab/

Repository: https://github.com/baditaflorin/forensics-in-tab

## Context

```mermaid
C4Context
  title Forensics in Tab Context
  Person(investigator, "Investigator", "Drops local evidence into the browser")
  System_Boundary(pages, "GitHub Pages") {
    System(staticApp, "Static React app", "HTML, CSS, JS, WASM assets")
  }
  System_Ext(localEvidence, "Local evidence files", "Disk image, memory dump, binary sample")
  Rel(investigator, staticApp, "Loads over HTTPS")
  Rel(investigator, localEvidence, "Selects or drops")
  Rel(staticApp, localEvidence, "Reads with browser File APIs")
```

## Container

```mermaid
flowchart LR
  subgraph "GitHub Pages: https://baditaflorin.github.io/forensics-in-tab/"
    App["React + TypeScript app"]
    Static["build-info.json and static assets"]
    Wasm["Lazy Capstone WASM asset"]
  end

  subgraph "Investigator Browser"
    FileAPI["File API"]
    Disk["Disk carving analyzer"]
    Memory["Memory triage analyzer"]
    Yara["YARA subset rule engine"]
    Disasm["Disassembly adapter"]
    Report["JSON report export"]
  end

  LocalFile["Local evidence file"] --> FileAPI
  App --> FileAPI
  FileAPI --> Disk
  FileAPI --> Memory
  FileAPI --> Yara
  FileAPI --> Disasm
  Disk --> Report
  Memory --> Report
  Yara --> Report
  Disasm --> Report
  Wasm -. loaded on demand .-> Disasm
```

## Boundaries

Evidence bytes do not leave the browser. There is no runtime API, auth service, database, telemetry endpoint, Docker backend, or server-side worker in v1.

## Module Map

- `src/features/evidence/`: file intake, hashing, metadata.
- `src/features/disk/`: MBR parsing and signature-based carving.
- `src/features/memory/`: strings, IOC extraction, PE hints, entropy hotspots.
- `src/features/yara/`: local YARA-compatible subset parser and evaluator.
- `src/features/disasm/`: Capstone WASM adapter with x86 fallback.
- `src/features/report/`: JSON report assembly and export.
