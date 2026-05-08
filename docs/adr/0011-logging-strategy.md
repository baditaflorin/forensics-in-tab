# 0011 - Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs, and production browser logs can leak investigation context.

## Decision

Production code avoids routine console logging. User-visible errors are shown in the interface. Development-only diagnostics may use browser devtools while building.

## Consequences

Investigators get clear local errors without evidence details being written to persistent logs by the app.

## Alternatives Considered

Remote logging was rejected because it would create a privacy-sensitive telemetry surface.
