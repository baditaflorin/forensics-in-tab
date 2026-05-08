#!/usr/bin/env bash
set -euo pipefail

npm run build

PORT="${PORT:-4173}"
node scripts/serve-pages.mjs "$PORT" >/tmp/forensics-in-tab-smoke.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true; wait "$SERVER_PID" 2>/dev/null || true' EXIT

READY=0
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$PORT/forensics-in-tab/" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 0.5
done

if [ "$READY" != "1" ]; then
  cat /tmp/forensics-in-tab-smoke.log
  exit 1
fi

npx playwright test test/e2e/smoke.spec.ts --config=playwright.config.ts
