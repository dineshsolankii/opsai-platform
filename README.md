# OpsAI - AI Content & Operations Assistant

OpsAI is a multi-agent AI productivity platform designed for college teams, clubs, and administrative workflows. It automates daily operations through four specialized AI agents, making it easier to manage content creation, meeting analysis, report generation, and task prioritization.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with Tailwind CSS
- **Backend**: Python (FastAPI)
- **AI**: OpenRouter API (`openai/gpt-4o-mini`)
- **Styling**: Clean, modern dashboard UI

## Project Structure

The project is a monorepo with the following structure:

```
/
├── frontend/     # Next.js application
├── backend/      # FastAPI Python application
└── .env          # Environment variables
```

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Configure Environment Variables

Create a `.env` file in the root of the project and add the following variables. 

**IMPORTANT: You must provide a valid OpenRouter API key for the application to work.**

```
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
MODEL_NAME=openai/gpt-4o-mini
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Replace `your_api_key_here` with your actual OpenRouter API key.

#### Frontend Environment
The frontend also requires a `.env.local` file inside the `frontend` directory (already created during setup):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Set Up the Backend

Navigate to the `backend` directory and install the required Python packages.

```bash
cd backend
pip install -r requirements.txt
```

Then, run the FastAPI server:

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

The backend server will be running at `http://localhost:8000`.

### 4. Set Up the Frontend

In a new terminal, navigate to the `frontend` directory and install the Node.js dependencies.

```bash
cd frontend
npm install
```

Then, run the Next.js development server:

```bash
npm run dev
```

The frontend application will be available at `http://localhost:3000`.

## How to Use

Once both the frontend and backend servers are running, open your browser and navigate to `http://localhost:3000`. You can use the sidebar to switch between the four AI agents:

- **Writing Assistant**: Generate various types of content like emails, announcements, and social media posts.
- **Meeting Summarizer**: Paste a meeting transcript to get a concise summary, key points, decisions, and action items.
- **Report Generator**: Create structured reports from your data and notes.
- **Task Manager**: Prioritize your tasks and get suggestions for managing your projects.
