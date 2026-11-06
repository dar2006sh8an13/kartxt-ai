import logging
import httpx
from fastapi import HTTPException
from .config import Settings
from .schemas import AIRequest

logger = logging.getLogger(__name__)


class OllamaService:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def chat(self, request: AIRequest) -> str:
        instruction = request.context.get("instruction", "Be a helpful educational assistant.")
        language_instruction = (
            "Respond only in English."
            if request.language == "English"
            else "Respond only in Kannada using Kannada script (ಕನ್ನಡ ಲಿಪಿ). Do not translate the response into English unless the user asks."
        )
        messages = [{"role": "system", "content": f"{instruction} {language_instruction} Be accurate, clear, and age-appropriate. Do not claim certainty about exam questions or career outcomes."}]
        messages.extend(message.model_dump() for message in request.messages)
        try:
            async with httpx.AsyncClient(timeout=self.settings.ollama_timeout_seconds) as client:
                response = await client.post(
                    f"{self.settings.ollama_base_url.rstrip('/')}/api/chat",
                    json={"model": self.settings.ollama_model, "messages": messages, "stream": False},
                )
                response.raise_for_status()
                data = response.json()
        except httpx.TimeoutException as exc:
            logger.warning("Ollama request timed out")
            raise HTTPException(status_code=504, detail="The AI model took too long to respond.") from exc
        except httpx.HTTPStatusError as exc:
            logger.warning("Ollama returned status %s", exc.response.status_code)
            raise HTTPException(status_code=502, detail="The configured AI model is unavailable.") from exc
        except httpx.RequestError as exc:
            logger.warning("Could not connect to Ollama: %s", exc)
            raise HTTPException(status_code=503, detail="Could not connect to the local AI service. Is Ollama running?") from exc
        message = data.get("message", {}).get("content")
        if not isinstance(message, str) or not message.strip():
            raise HTTPException(status_code=502, detail="The AI service returned an empty response.")
        return message.strip()
