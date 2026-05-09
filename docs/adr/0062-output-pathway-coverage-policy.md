# 0062 - Output Pathway Coverage Policy

## Status

Accepted

## Context

Investigators need to take findings into notes, ticketing systems, spreadsheets, and later sessions.

## Decision

Phase 3 will ship four output classes: machine-readable session export, machine-readable finding exports, clipboard copy, and a print-friendly report view. Small sessions may also be shared through a URL hash.

## Consequences

The report panel becomes a workflow hub instead of a single download button. Large cases may exceed practical hash-sharing limits and will rely on saved session files instead.

## Alternatives Considered

Restricting output to JSON-only was rejected because it makes the app a dead end in normal forensic note-taking workflows.
