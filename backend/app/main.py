import logging
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .ai_service import OllamaService
from .config import get_settings
from .schemas import AIRequest, AIResponse

logging.basicConfig(level=logging.INFO)
settings = get_settings()
app = FastAPI(title="KarTxt AI API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.origins, allow_credentials=False, allow_methods=["POST", "GET"], allow_headers=["Content-Type"])
service = OllamaService(settings)
router = APIRouter(prefix="/api/ai", tags=["AI features"])
FEATURES = {"teacher", "tutor", "doubt-solver", "exam-assistant", "notes-generator", "quiz-generator", "study-planner", "career-guide", "voice-teacher", "teacher-assistant"}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/{feature}", response_model=AIResponse)
async def feature_chat(feature: str, request: AIRequest) -> AIResponse:
    if feature not in FEATURES:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Unknown AI feature.")
    return AIResponse(message=await service.chat(request), model=settings.ollama_model)


app.include_router(router)
