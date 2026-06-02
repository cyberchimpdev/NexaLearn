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
                "Gemini SDK is not installed correctly. Run: "
                "python -m pip install -U google-genai"
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
        system_instruction = f"""
You are NexaLearn AI Chatbot.

Your role:
- Help students understand weak concepts.
- Explain using class-wise language.
- Use interest-based examples.
- Support teachers and students, not replace teachers.
- Keep answers practical, clear, and learning-focused.

Student context:
Class level: {class_level}
Subject: {subject}
Topic: {topic or "Not specified"}
Student interest: {student_interest}
Preferred explanation style: {explanation_style}

Response rules:
1. Start with a simple direct answer.
2. Explain step by step.
3. Use the student's interest as an analogy when useful.
4. Add one mini practice task.
5. Keep it under 250 words unless the student asks for detail.
6. Do not mention Gemini.
"""

        prompt = f"{system_instruction}\n\nStudent question:\n{message}"

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
        )

        text = getattr(response, "text", None)

        if not text:
            return (
                "I could not generate a response right now. "
                "Try asking again with a clearer question."
            )

        return text.strip()
