from __future__ import annotations

from typing import Any

from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .gemini_client import gemini_client
from .practice_evaluator import ai_practice_evaluator
from .prompts import chat_prompt
from .quiz_generator import ai_practice_quiz_generator
from .schemas import AnswerAnalysisInput, ChatInput
from .serializers import (
    AnalyzeAnswerSerializer,
    ChatSerializer,
    EvaluatePracticeSerializer,
    GenerateQuizSerializer,
)
from .services import local_learning_agent


class AIHealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args: Any, **kwargs: Any) -> Response:
        available_models = gemini_client.list_available_models()
        result = gemini_client.generate_text("Reply with only this word: OK")

        return Response(
            {
                "status": "ok",
                "service": "NexaLearn AI Agent",
                "gemini_configured": gemini_client.is_configured(),
                "gemini_live": bool(result.get("ok")),
                "configured_model": getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash"),
                "working_model": result.get("model", ""),
                "gemini_error": result.get("error", ""),
                "tried_models": result.get("tried_models", []),
                "available_models": available_models,
            },
            status=status.HTTP_200_OK,
        )


class TutorAIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args: Any, **kwargs: Any) -> Response:
        serializer = ChatSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "detail": "Invalid chat payload.",
                    "errors": serializer.errors,
                    "received": request.data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        payload = ChatInput(
            message=data["message"],
            subject=data.get("subject", "General"),
            topic=data.get("topic", "General"),
            student_class=data.get("student_class"),
            learning_style=data.get("learning_style"),
            interests=data.get("interests", []),
        )

        prompt = chat_prompt(
            message=payload.message,
            subject=payload.subject,
            topic=payload.topic,
            student_class=payload.student_class,
            learning_style=payload.learning_style,
            interests=payload.interests,
        )

        result = gemini_client.generate_text(prompt)

        if result["ok"]:
            answer = result["text"]
            provider = "gemini"
        else:
            answer = self._fallback_chat(payload)
            provider = "local"

        return Response(
            {
                "message": answer,
                "reply": answer,
                "answer": answer,
                "provider": provider,
            },
            status=status.HTTP_200_OK,
        )

    def _fallback_chat(self, payload: ChatInput) -> str:
        interest_line = ""

        if payload.interests:
            interest_line = (
                f"\n\nInterest example: Think of it like {payload.interests[0]}. "
                "First understand the rule, then apply it."
            )

        return (
            f"Let's break it down.\n\n"
            f"Subject: {payload.subject}\n"
            f"Topic: {payload.topic}\n\n"
            f"Simple explanation: First understand the core concept. Then connect it with the question. "
            f"After that, apply the rule, formula, or logic step by step."
            f"{interest_line}\n\n"
            f"Practice task: Solve 3 easy questions and review your mistakes."
        )


class AnalyzeAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args: Any, **kwargs: Any) -> Response:
        serializer = AnalyzeAnswerSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "detail": "Invalid answer-analysis payload.",
                    "errors": serializer.errors,
                    "received": request.data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        payload = AnswerAnalysisInput(
            question_text=data["question_text"],
            correct_answer=data["correct_answer"],
            student_answer=data["student_answer"],
            subject=data.get("subject", "General"),
            topic=data.get("topic", "General"),
            difficulty=data.get("difficulty", "medium"),
            question_type=data.get("question_type", "short_answer"),
            marks=data.get("marks", 1),
            student_class=data.get("student_class"),
            learning_style=data.get("learning_style"),
            interests=data.get("interests", []),
        )

        result = local_learning_agent.analyze_answer(payload)

        return Response(result.to_dict(), status=status.HTTP_200_OK)


class AIPracticeGenerateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args: Any, **kwargs: Any) -> Response:
        serializer = GenerateQuizSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "detail": "Invalid quiz-generation payload.",
                    "errors": serializer.errors,
                    "received": request.data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        result = ai_practice_quiz_generator.generate_quiz(
            subject=data["subject"],
            topic=data["topic"],
            student_class=data.get("student_class", "12"),
            difficulty=data.get("difficulty", "Medium"),
            total_questions=data.get("total_questions", 5),
            marks_per_question=data.get("marks_per_question", 2),
            interests=data.get("interests", []),
        )

        return Response(result, status=status.HTTP_200_OK)


class AIPracticeEvaluateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args: Any, **kwargs: Any) -> Response:
        serializer = EvaluatePracticeSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "detail": "Invalid quiz-evaluation payload.",
                    "errors": serializer.errors,
                    "received": request.data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        result = ai_practice_evaluator.evaluate_batch(
            questions=data["questions"],
            answers=data["answers"],
            subject=data.get("subject", "General"),
            topic=data.get("topic", "General"),
            student_class=data.get("student_class", "12"),
            interests=data.get("interests", []),
        )

        return Response(result, status=status.HTTP_200_OK)
