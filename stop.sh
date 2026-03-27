#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
PIDS_FILE="$PROJECT_ROOT/.opsai_pids"

echo "=== OpsAI — Stopping All Services ==="

kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null)
  if [ -n "$pids" ]; then
    echo "  Killing process(es) on port $port: $pids"
    kill -TERM $pids 2>/dev/null || true
  fi
}

# ── Kill by saved PIDs (from start.sh) ───────────────────────────────────────
if [ -f "$PIDS_FILE" ]; then
  while IFS= read -r pid; do
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "  Stopping PID $pid"
      kill -TERM "$pid" 2>/dev/null || true
    fi
  done < "$PIDS_FILE"
  rm -f "$PIDS_FILE"
fi

# ── Kill by port (belt-and-suspenders) ───────────────────────────────────────
kill_port 8000   # uvicorn
kill_port 3000   # Next.js

# ── Kill Celery workers ───────────────────────────────────────────────────────
CELERY_PIDS=$(pgrep -f "celery.*worker" 2>/dev/null || true)
if [ -n "$CELERY_PIDS" ]; then
  echo "  Stopping Celery workers: $CELERY_PIDS"
  kill -TERM $CELERY_PIDS 2>/dev/null || true
fi

# ── Stop Docker containers ────────────────────────────────────────────────────
echo "  Stopping Docker services..."
docker-compose -f "$PROJECT_ROOT/docker-compose.yml" down 2>/dev/null || true

echo ""
echo "OpsAI stopped."
