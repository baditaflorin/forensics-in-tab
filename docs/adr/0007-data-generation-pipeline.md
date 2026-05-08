# 0007 - Data Generation Pipeline

## Status

Accepted

## Context

Data generation pipelines apply to Mode B projects that precompute public artifacts.

## Decision

Do not add a data generation pipeline in Mode A. `make data` is a documented no-op that explains evidence is processed locally in the browser.

## Consequences

There are no committed forensic data artifacts, no release-hosted Parquet/SQLite/JSON bundles, and no freshness cadence.

## Alternatives Considered

A small sample corpus was rejected because it could encourage committing evidence-like files and is unnecessary for v1 operation.
