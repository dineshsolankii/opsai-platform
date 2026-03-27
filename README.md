# OpsAI — AI Content & Operations Assistant

A multi-agent AI productivity platform for college teams, clubs, and administrative workflows.
Powered by OpenRouter (GPT-4o-mini) · FastAPI · Next.js 14 · Celery · Redis · PostgreSQL

---

## Agents

| Agent | What it does |
|---|---|
| **Writing Assistant** | Generates emails, announcements, social posts, newsletters |
| **Meeting Summarizer** | Extracts summary, key points, decisions, action items from transcripts |
| **Report Generator** | Creates structured reports (weekly, event, budget, activity) |
| **Task Manager** | Prioritizes task lists with AI-generated suggestions |

---

## Local Setup

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL + Redis)
- Python 3.10 or later
- Node.js 18 or later

### 1. Clone the repo

```bash
git clone https://github.com/dineshsolankii/opsai-platform.git
cd opsai-platform
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here   # get a key from openrouter.ai
SECRET_KEY=<run: openssl rand -hex 32>        # generate a random secret
```

Everything else (`POSTGRES_*`, `CELERY_*`, `CORS_ORIGINS`) is pre-filled for local development.

### 3. Start everything (single command)

```bash
./start.sh
```

This script automatically:
1. Starts PostgreSQL (port **5433**) and Redis (port 6379) via Docker
2. Creates a Python virtual environment if it doesn't exist
3. Installs all Python dependencies
4. Starts the FastAPI backend (port 8000) with hot-reload
5. Starts the Celery worker
6. Installs npm packages if missing
7. Starts the Next.js frontend (port 3000)

All logs are written to `./logs/`.

### 4. Open in browser

| Service | URL |
|---|---|
| Frontend app | http://localhost:3000 |
| Backend API docs | http://localhost:8000/docs |
| Health check | http://localhost:8000/health |

### 5. Register and log in

1. Go to `http://localhost:3000/register` → create an account
2. Go to `http://localhost:3000/login` → sign in
3. Use the sidebar to switch between the 4 AI agents

### Stop everything

```bash
./stop.sh
```

---

## Manual Setup (without start.sh)

```bash
# Terminal 1 — Docker services
docker-compose up -d

# Terminal 2 — Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 3 — Celery worker
cd backend
source .venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info

# Terminal 4 — Frontend
cd frontend
npm install
npm run dev
```

---

## Deployment

### Backend → Render.com

1. Create a **PostgreSQL** instance in the Render dashboard
2. Connect this GitHub repo — Render auto-detects `render.yaml` and creates the web service, Celery worker, and Redis
3. Set these environment variables manually in the Render dashboard:

| Service | Variable | Value |
|---|---|---|
| Web + Worker | `OPENROUTER_API_KEY` | Your OpenRouter API key |
| Web + Worker | `DATABASE_URL` | "Internal Database URL" from Render Postgres |
| Web + Worker | `SECRET_KEY` | Run `openssl rand -hex 32` |
| Web only | `CORS_ORIGINS` | Your Vercel frontend URL |

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import this repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g. `https://opsai-backend.onrender.com`)
4. Deploy

After both are deployed, update `CORS_ORIGINS` on Render to your Vercel URL.

---

## Architecture

```
Browser (Next.js 14)
  │  JWT in localStorage
  ▼
FastAPI (uvicorn)           ← CORS configured for frontend origin
  │  validates JWT token
  ▼
Celery Task Queue  ──────→  Redis (broker + result backend)
  │
  ▼
OpenRouter API (GPT-4o-mini)
  │
  ▼
PostgreSQL (SQLAlchemy)     ← stores users + generation history
```

**Auth flow:** Register → Login → receive JWT → send as `Authorization: Bearer <token>` on every request.

**Async flow:** POST to agent endpoint → receive `task_id` → frontend polls `/api/tasks/{task_id}` every 2s → display result when `status === "SUCCESS"`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS v3, shadcn/ui (Base UI) |
| Backend | FastAPI, Python 3.10+, Pydantic v2, pydantic-settings |
| Database | PostgreSQL 16, SQLAlchemy 2.0 |
| Queue | Celery 5.4, Redis 7 |
| Auth | JWT (python-jose), bcrypt (passlib) |
| AI | OpenRouter API, openai/gpt-4o-mini |

---

## Troubleshooting

**White screen / frontend 500 errors**
```bash
./stop.sh && rm -rf frontend/.next && ./start.sh
```

**Port 5432 conflict (local Postgres already running)**
This project maps Docker Postgres to port **5433** to avoid clashing with a local Postgres installation. The `.env` is pre-configured for this — no changes needed.

**Backend won't start — `OPENROUTER_API_KEY` missing**
Make sure `.env` exists with a valid key. Run `cp .env.example .env` and fill it in.

**Celery can't connect to Redis**
Ensure Docker is running: `docker-compose up -d`, then check with `docker-compose ps`.

**`pip install` fails on psycopg2**
On macOS: `brew install libpq`. Or ensure you're installing `psycopg2-binary` (already in `requirements.txt`).
