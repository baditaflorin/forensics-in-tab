# 0063 - Half-Baked Feature Triage Decisions

## Status

Accepted

## Context

The audit found features that work on the happy path but do not complete the user task.

## Decision

Keep and finish these areas:

- evidence intake
- report export
- disassembly controls
- YARA workflow
- reusable case sessions

Do not add remote URL intake, folder recursion, or backend-backed sharing in Phase 3.

## Consequences

The visible surface stays familiar, but more of it becomes dependable. Out-of-scope items are documented instead of implied.

## Alternatives Considered

Hiding major panels was rejected because the underlying analyzers are useful; the missing work is workflow completion around them.
