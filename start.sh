#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== OpsAI Startup ==="

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
until docker-compose -f "$PROJECT_ROOT/docker-compose.yml" exec -T postgres pg_isready -U opsai_user -d opsai > /dev/null 2>&1; do
  echo "  Postgres not ready, retrying in 2s..."
  sleep 2
done
echo "  Postgres ready."

# Wait for Redis
echo "Waiting for Redis..."
until docker-compose -f "$PROJECT_ROOT/docker-compose.yml" exec -T redis redis-cli ping > /dev/null 2>&1; do
  echo "  Redis not ready, retrying in 2s..."
  sleep 2
done
echo "  Redis ready."

# Start backend (uvicorn)
cd "$PROJECT_ROOT/backend"
source .venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend started (PID $BACKEND_PID)"

# Start Celery worker
celery -A app.core.celery_app worker --loglevel=info &
CELERY_PID=$!
echo "Celery worker started (PID $CELERY_PID)"

# Start frontend
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
echo "Frontend started (PID $FRONTEND_PID)"

echo ""
echo "OpsAI is running:"
echo "  Frontend : http://localhost:3000"
echo "  Backend  : http://localhost:8000"
echo "  API Docs : http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services."

wait
