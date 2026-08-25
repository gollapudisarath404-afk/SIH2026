from typing import Literal

from pydantic import BaseModel, Field


class AIExplainRequest(BaseModel):
    schemeId: int
    language: Literal["English", "Telugu"] = "English"


class AIExplainResponse(BaseModel):
    schemeId: int
    schemeName: str
    language: str
    explanation: str


class AIChatRequest(BaseModel):
    schemeId: int
    language: Literal["English", "Telugu"] = "English"
    question: str = Field(..., min_length=1)


class AIChatResponse(BaseModel):
    schemeId: int
    question: str
    language: str
    answer: str
