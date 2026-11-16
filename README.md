# KarTxt AI

**A bilingual educational AI assistant for Karnataka learners and teachers.**

KarTxt AI is a React + FastAPI application that connects a learning workspace to a locally hosted language model through Ollama. It is designed to support educational workflows in English and Kannada.

## Highlights

- English and Kannada response-language selection.
- Responsive learning dashboard and feature routes.
- Local model inference through Ollama.
- FastAPI backend with request validation and centralized model configuration.
- Timeout and error handling for model requests.
- Frontend communicates with the backend API; it does not call Ollama directly.

## Architecture

```text
Browser (React)
     |
     | HTTP API
     v
FastAPI backend
     |
     | Ollama API
     v
Local Gemma model
```

## Technology

| Layer | Technology |
|---|---|
| Frontend | React, JavaScript/TypeScript tooling |
| Backend | Python, FastAPI, Uvicorn |
| Model runtime | Ollama |
| Language model | Configured Gemma model |
| Local development | Vite frontend and Python virtual environment |

## Prerequisites

- Python version compatible with `backend/requirements.txt`.
- Node.js and npm.
- [Ollama](https://ollama.com/) installed and running.
- Sufficient RAM/compute for the selected model.

## Run Locally

### 1. Start Ollama

```powershell
ollama pull gemma:latest
ollama serve
```

If Ollama is already running as a service, do not start a second instance. Ensure the configured model name matches the model available locally.

### 2. Configure and start the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

Review `.env.example` and set only the values required by your local configuration. Do not commit secrets.

### 3. Start the frontend

In a second terminal, from the repository root:

```bash
npm install
npm run dev
```

The Vite development server is expected at [http://localhost:5173](http://localhost:5173). The backend is expected at [http://localhost:8000](http://localhost:8000).

Set `VITE_API_URL` if the backend is hosted at a different address.

## Current Scope

The documented baseline includes the dashboard, language and theme controls, conversation handling, learning feature routes, request validation, Ollama configuration, and local AI integration.

Persistent PostgreSQL storage, authentication, and production deployment hardening are described as follow-up work; do not assume they are already implemented.

## Safety and Responsible Use

Use generated responses as learning assistance, not as an authoritative source. Verify important academic information against textbooks, instructors, and official materials. Do not send private student data to an untrusted model endpoint.

## Contributing

Open an issue for substantial changes. Use focused branches, include setup or test instructions, and document changes to model prompts, model configuration, and API behavior.

## License

No license is specified in this repository yet.
