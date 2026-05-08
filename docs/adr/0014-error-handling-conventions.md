# 0014 - Error Handling Conventions

## Status

Accepted

## Context

Forensic workflows often hit malformed data. Errors should be clear and non-destructive.

## Decision

Analyzer functions return typed results with warnings where possible and throw only for invalid input that prevents analysis. UI code catches failures and displays concise recovery guidance.

## Consequences

Malformed evidence does not crash the whole app. Reports can include warnings alongside findings.

## Alternatives Considered

Silent failure was rejected because investigators need to know what was and was not analyzed.
