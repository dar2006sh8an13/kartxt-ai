# KarTxt AI

KarTxt AI is a React + FastAPI educational assistant for Karnataka students and teachers. The interface contains exactly the ten requested learning destinations, and all AI responses are generated through the configured local Ollama model.

## Run locally

### Ollama

Install Ollama, then start the configured model:

```powershell
ollama pull gemma:latest
ollama serve
```

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```powershell
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. It never calls Ollama directly; requests go to the FastAPI service. Set `VITE_API_URL` when the backend runs at another address.

Use the **Response language** selector in the learning workspace to receive AI responses in either English or Kannada.

## Current scope

The working baseline includes the responsive dashboard, language and theme controls, conversation handling, all ten feature routes, request validation, centralized Ollama configuration, timeout/error handling, and local AI integration. Persistent PostgreSQL data, authentication, and production deployment hardening remain follow-up work before production use.
