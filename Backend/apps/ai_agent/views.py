from __future__ import annotations

from dataclasses import asdict

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .gemini_client import GeminiChatClient
from .schemas import AnswerAnalysisInput
from .serializers import AnalyzeAnswerSerializer, ChatMessageSerializer
from .services import AIAnalysisService


class AnalyzeAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "message": "Use POST to analyze an answer with NexaLearn Python AI Agent.",
                "required_format": {
                    "class_level": "12",
                    "subject": "Physics",
                    "topic": "Electric Field",
                    "question": "A charge of 2 C experiences a force of 10 N. Find the electric field.",
                    "correct_answer": "5 N/C",
                    "student_answer": "20 N/C",
                    "marks": 2,
                    "student_interest": "cricket",
                    "explanation_style": "exam_focused",
                },
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = AnalyzeAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payload = AnswerAnalysisInput(**serializer.validated_data)
        result = AIAnalysisService().analyze_answer(payload)

        return Response(asdict(result), status=status.HTTP_200_OK)


class GeminiChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "message": "Use POST to chat with NexaLearn Gemini AI Chatbot.",
                "required_format": {
                    "message": "Explain electric field using cricket example.",
                    "class_level": "12",
                    "subject": "Physics",
                    "topic": "Electric Field",
                    "student_interest": "cricket",
                    "explanation_style": "exam_focused",
                },
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = ChatMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            reply = GeminiChatClient().generate_chat_response(
                message=serializer.validated_data["message"],
                class_level=serializer.validated_data["class_level"],
                subject=serializer.validated_data["subject"],
                topic=serializer.validated_data["topic"],
                student_interest=serializer.validated_data["student_interest"],
                explanation_style=serializer.validated_data["explanation_style"],
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except ImportError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as exc:
            return Response(
                {"detail": f"Gemini chatbot failed: {str(exc)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "reply": reply,
                "model": "gemini",
            },
            status=status.HTTP_200_OK,
        )
