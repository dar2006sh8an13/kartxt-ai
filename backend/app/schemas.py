from typing import Literal
from pydantic import BaseModel, Field

ResponseLanguage = Literal["English", "Kannada"]


class Message(BaseModel):
    role: Literal["user", "assistant"] = "user"
    content: str = Field(min_length=1, max_length=12000)


class AIRequest(BaseModel):
    messages: list[Message] = Field(min_length=1, max_length=30)
    context: dict[str, str] = Field(default_factory=dict, max_length=10)
    language: ResponseLanguage = "English"


class AIResponse(BaseModel):
    message: str
    model: str
