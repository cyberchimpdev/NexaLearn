from __future__ import annotations

import os
from typing import Any

import google.generativeai as genai
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import AIAnalysisService


def get_gemini_api_key() -> str:
    return (
        os.getenv("GEMINI_API_KEY")
        or getattr(settings, "GEMINI_API_KEY", "")
        or ""
    )


def get_gemini_models() -> list[str]:
    primary_model = (
        os.getenv("GEMINI_MODEL")
        or getattr(settings, "GEMINI_MODEL", "")
        or "gemini-1.5-flash"
    )

    fallback_models = [
        primary_model,
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro",
    ]

    unique_models: list[str] = []

    for model in fallback_models:
        if model and model not in unique_models:
            unique_models.append(model)

    return unique_models


def local_study_fallback(
    message: str,
    subject: str = "General",
    topic: str = "General",
    learning_profile: dict[str, Any] | None = None,
) -> str:
    profile = learning_profile or {}
    learning_style = profile.get("learning_style", "simple")
    interests = profile.get("interests", [])

    interest_text = (
        ", ".join(interests)
        if isinstance(interests, list) and interests
        else "real-life examples"
    )

    return (
        f"Gemini is temporarily overloaded, so NexaLearn is using local AI fallback.\n\n"
        f"Subject: {subject}\n"
        f"Topic: {topic}\n\n"
        f"Your doubt: {message}\n\n"
        f"Simple explanation:\n"
        f"Break this topic into three parts: the definition, the main rule/formula, "
        f"and one example. Since your learning style is '{learning_style}', connect "
        f"the idea with {interest_text}.\n\n"
        f"Quick recovery task:\n"
        f"1. Write the definition of {topic} in one line.\n"
        f"2. Write one example.\n"
        f"3. Solve one similar question and compare it with the correct answer."
    )


class AnalyzeAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        service = AIAnalysisService()
        result = service.analyze_answer(request.data)
        return Response(result, status=status.HTTP_200_OK)


class GenerateQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        service = AIAnalysisService()
        result = service.generate_quiz(request.data)
        return Response(result, status=status.HTTP_200_OK)


class GeminiChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = str(request.data.get("message", "")).strip()
        subject = str(request.data.get("subject", "General")).strip() or "General"
        topic = str(request.data.get("topic", "General")).strip() or "General"
        learning_profile = request.data.get("learning_profile") or {}

        if not message:
            return Response(
                {"error": "Message is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        api_key = get_gemini_api_key()

        if not api_key:
            return Response(
                {
                    "reply": local_study_fallback(
                        message=message,
                        subject=subject,
                        topic=topic,
                        learning_profile=learning_profile,
                    ),
                    "provider": "local_fallback",
                    "warning": "Gemini API key is missing.",
                },
                status=status.HTTP_200_OK,
            )

        genai.configure(api_key=api_key)

        system_prompt = f"""
You are NexaLearn AI Tutor.

Your role:
- Explain academic doubts clearly.
- Adapt explanation to the student's grade, learning style, and interests.
- Keep answers short, useful, and practical.
- Do not replace the teacher; support learning recovery.
- Give one small practice task at the end.

Subject: {subject}
Topic: {topic}
Learning profile: {learning_profile}

Student question:
{message}
"""

        last_error = ""

        for model_name in get_gemini_models():
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(system_prompt)

                reply = getattr(response, "text", "") or ""

                if reply.strip():
                    return Response(
                        {
                            "reply": reply.strip(),
                            "provider": "gemini",
                            "model": model_name,
                        },
                        status=status.HTTP_200_OK,
                    )

                last_error = f"{model_name} returned empty response."

            except Exception as exc:
                last_error = str(exc)

                if "503" in last_error or "UNAVAILABLE" in last_error.upper():
                    continue

                if "429" in last_error or "quota" in last_error.lower():
                    continue

                continue

        return Response(
            {
                "reply": local_study_fallback(
                    message=message,
                    subject=subject,
                    topic=topic,
                    learning_profile=learning_profile,
                ),
                "provider": "local_fallback",
                "warning": "Gemini models were unavailable, so local fallback was used.",
                "last_error": last_error,
            },
            status=status.HTTP_200_OK,
        )
