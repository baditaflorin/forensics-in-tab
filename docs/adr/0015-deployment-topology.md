# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode A deployment is GitHub Pages only.

## Decision

Serve the app from https://baditaflorin.github.io/forensics-in-tab/ with no runtime backend and no `deploy/` directory.

## Consequences

There is no nginx, Docker Compose, TLS renewal, server backup, or Prometheus topology in v1. GitHub serves static assets over HTTPS.

## Alternatives Considered

A Docker backend was rejected for the same reasons recorded in ADR 0001.
