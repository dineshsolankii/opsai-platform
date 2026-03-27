#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV="$BACKEND_DIR/.venv"
PIDS_FILE="$PROJECT_ROOT/.opsai_pids"

echo "=== OpsAI — Starting All Services ==="
mkdir -p "$PROJECT_ROOT/logs"

# ── 1. Docker services (Postgres + Redis) ───────────────────────────────────
echo ""
echo "[1/4] Starting Docker services (PostgreSQL + Redis)..."
docker-compose -f "$PROJECT_ROOT/docker-compose.yml" up -d

echo "  Waiting for PostgreSQL to be ready..."
for i in $(seq 1 30); do
  if docker-compose -f "$PROJECT_ROOT/docker-compose.yml" exec -T postgres \
      pg_isready -U opsai_user -d opsai > /dev/null 2>&1; then
    echo "  PostgreSQL ready."
    break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "  ERROR: PostgreSQL did not become ready in time." && exit 1
  fi
done

echo "  Waiting for Redis to be ready..."
for i in $(seq 1 30); do
  if docker-compose -f "$PROJECT_ROOT/docker-compose.yml" exec -T redis \
      redis-cli ping > /dev/null 2>&1; then
    echo "  Redis ready."
    break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "  ERROR: Redis did not become ready in time." && exit 1
  fi
done

# ── 2. Python virtual environment & dependencies ─────────────────────────────
echo ""
echo "[2/4] Setting up Python environment..."
if [ ! -f "$VENV/bin/activate" ]; then
  echo "  Creating virtual environment..."
  python3 -m venv "$VENV"
fi
source "$VENV/bin/activate"

echo "  Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r "$BACKEND_DIR/requirements.txt"
echo "  Python environment ready."

# ── 3. Backend: uvicorn + celery ─────────────────────────────────────────────
echo ""
echo "[3/4] Starting backend services..."

cd "$BACKEND_DIR"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload \
  > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
BACKEND_PID=$!

celery -A app.core.celery_app worker --loglevel=info \
  > "$PROJECT_ROOT/logs/celery.log" 2>&1 &
CELERY_PID=$!

echo "  Backend  PID: $BACKEND_PID  (logs/backend.log)"
echo "  Celery   PID: $CELERY_PID  (logs/celery.log)"

# ── 4. Frontend: Next.js ─────────────────────────────────────────────────────
echo ""
echo "[4/4] Starting frontend..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
  echo "  Installing npm packages..."
  npm install --silent
fi

npm run dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID  (logs/frontend.log)"

# ── Save PIDs for stop.sh ─────────────────────────────────────────────────────
printf "%s\n%s\n%s\n" "$BACKEND_PID" "$CELERY_PID" "$FRONTEND_PID" > "$PIDS_FILE"

echo ""
echo "══════════════════════════════════════════"
echo "  OpsAI is running!"
echo "  Frontend : http://localhost:3000"
echo "  Backend  : http://localhost:8000"
echo "  API Docs : http://localhost:8000/docs"
echo ""
echo "  Logs     : ./logs/"
echo "  Stop all : ./stop.sh"
echo "══════════════════════════════════════════"
