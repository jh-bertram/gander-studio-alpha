#!/usr/bin/env bash
# Launch Gander Studio: start dev server, wait for Vite, open browser.
set -euo pipefail

SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}")"
PROJECT_DIR="$(dirname "$SCRIPT_PATH")"
cd "$PROJECT_DIR"

if [[ ! -f .env ]]; then
  echo "ERROR: .env missing in $PROJECT_DIR — copy .env.example and fill in GANDER_ROOT/LOADOUTS_DIR." >&2
  exit 1
fi

CLIENT_PORT=5173
SERVER_PORT="${SERVER_PORT:-3001}"

if ss -ltn "sport = :$CLIENT_PORT" | grep -q LISTEN; then
  echo "Gander Studio already running on :$CLIENT_PORT — opening browser."
  cmd.exe /c start "http://localhost:$CLIENT_PORT" >/dev/null 2>&1 || true
  exit 0
fi

echo "Starting dev server in $PROJECT_DIR ..."
npm run dev &
DEV_PID=$!
trap 'kill -- -$DEV_PID 2>/dev/null || true' EXIT INT TERM

echo -n "Waiting for Vite on :$CLIENT_PORT "
for _ in $(seq 1 60); do
  if ss -ltn "sport = :$CLIENT_PORT" | grep -q LISTEN; then
    echo " ready."
    cmd.exe /c start "http://localhost:$CLIENT_PORT" >/dev/null 2>&1 || true
    wait "$DEV_PID"
    exit $?
  fi
  echo -n "."
  sleep 1
done

echo
echo "ERROR: Vite did not come up within 60s." >&2
exit 1
