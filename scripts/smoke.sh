#!/usr/bin/env bash
set -euo pipefail

npm run build

PORT="${PORT:-4173}"
npx http-server docs -p "$PORT" -c-1 >/tmp/forensics-in-tab-smoke.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$PORT/forensics-in-tab/" >/dev/null; then
    break
  fi
  sleep 0.5
done

npx playwright test test/e2e/smoke.spec.ts --config=playwright.config.ts
