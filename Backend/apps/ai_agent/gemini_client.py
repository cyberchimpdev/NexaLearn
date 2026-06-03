from __future__ import annotations

import os


class GeminiChatClient:
    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is missing in backend .env file.")

        try:
            from google import genai
        except ImportError as exc:
            raise ImportError(
                "Gemini SDK is not installed. Run: python -m pip install -U google-genai"
            ) from exc

        self.client = genai.Client(api_key=self.api_key)

    def generate_chat_response(
        self,
        *,
        message: str,
        class_level: str,
        subject: str,
        topic: str,
        student_interest: str,
        explanation_style: str,
    ) -> str:
        prompt = f"""
You are NexaLearn AI Chatbot.

Goal:
Answer student doubts for any subject and any topic.

Student profile:
Class level: {class_level}
Subject: {subject}
Topic: {topic or "Not specified"}
Interest: {student_interest}
Style: {explanation_style}

Rules:
- Keep answer short and useful.
- Maximum 140 words unless the student asks for detail.
- Start directly with the answer.
- Use simple language.
- Use the student's interest only when it actually helps.
- Add 1 mini practice task at the end.
- Do not say you are Gemini.
- Do not replace the teacher; support learning.

Student question:
{message}
"""

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
        )

        text = getattr(response, "text", None)

        if not text:
            return "I could not generate a response right now. Try asking again clearly."

        return text.strip()
