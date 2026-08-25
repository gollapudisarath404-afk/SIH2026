import logging
import os
from typing import Optional

import google.generativeai as genai

from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    def generate_explanation(self, prompt: str) -> str:
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise ValueError("Gemini API key is not configured.")

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            response = model.generate_content(prompt)
            text = getattr(response, "text", None)
            if not text:
                raise RuntimeError("Gemini returned an empty response.")
            return text.strip()
        except Exception as error:
            logger.error(f"Gemini API error: {error}")
            raise error


gemini_service = GeminiService()
