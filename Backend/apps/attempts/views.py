from __future__ import annotations

from typing import Any

from django.db import transaction
from django.db.models import Prefetch
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai_agent.schemas import AnswerAnalysisInput
from apps.ai_agent.services import local_learning_agent
from apps.tests_app.models import Question, Test

from .models import Attempt, AttemptAnswer, Mistake
from .serializers import AttemptDetailSerializer, AttemptListSerializer


class SubmitAttemptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args: Any, **kwargs: Any) -> Response:
        user = request.user

        test_id = request.data.get("test_id")
        answers = request.data.get("answers", [])

        if not test_id:
            return Response(
                {"detail": "test_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(answers, list):
            return Response(
                {"detail": "answers must be a list."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            test = (
                Test.objects.select_related("created_by")
                .prefetch_related("questions")
                .get(id=test_id)
            )
        except Test.DoesNotExist:
            return Response(
                {"detail": "Test not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        question_map = {
            question.id: question
            for question in test.questions.all()
        }

        attempt = Attempt.objects.create(
            test=test,
            student=user,
            total_marks=0,
            obtained_marks=0,
        )

        total_marks = 0.0
        obtained_marks = 0.0
        analysis_payloads: list[dict[str, Any]] = []

        for answer_item in answers:
            question_id = answer_item.get("question_id")
            student_answer = str(answer_item.get("answer", "")).strip()

            if not question_id:
                continue

            try:
                question_id_int = int(question_id)
            except (TypeError, ValueError):
                continue

            question = question_map.get(question_id_int)

            if question is None:
                continue

            question_marks = float(getattr(question, "marks", 1) or 1)
            total_marks += question_marks

            correct_answer = str(getattr(question, "correct_answer", "") or "").strip()

            analysis_input = AnswerAnalysisInput(
                question_text=str(getattr(question, "text", "") or ""),
                correct_answer=correct_answer,
                student_answer=student_answer,
                subject=str(getattr(test, "subject", "General") or "General"),
                topic=str(getattr(question, "topic", "") or getattr(test, "topic", "General") or "General"),
                difficulty=str(getattr(question, "difficulty", "medium") or "medium"),
                question_type=str(getattr(question, "question_type", "short_answer") or "short_answer"),
                marks=int(question_marks),
                student_class=str(getattr(test, "student_class", "") or ""),
                learning_style=getattr(user, "learning_style", None),
                interests=self._get_user_interests(user),
            )

            analysis_result = local_learning_agent.analyze_answer(analysis_input)

            obtained_marks += float(analysis_result.score_awarded)

            attempt_answer = AttemptAnswer.objects.create(
                attempt=attempt,
                question=question,
                student_answer=student_answer,
                is_correct=analysis_result.is_correct,
                marks_awarded=analysis_result.score_awarded,
            )

            if not analysis_result.is_correct:
                Mistake.objects.create(
                    attempt=attempt,
                    attempt_answer=attempt_answer,
                    question=question,
                    weak_concept=analysis_result.weak_concept,
                    mistake_type=analysis_result.mistake_type,
                    explanation=analysis_result.explanation,
                    personalized_explanation=analysis_result.personalized_explanation,
                    revision_task=analysis_result.revision_task,
                )

            analysis_payloads.append(
                {
                    "question_id": question.id,
                    "question": analysis_input.question_text,
                    "student_answer": student_answer,
                    "correct_answer": correct_answer,
                    **analysis_result.to_dict(),
                }
            )

        attempt.total_marks = total_marks
        attempt.obtained_marks = obtained_marks
        attempt.percentage = self._calculate_percentage(obtained_marks, total_marks)
        attempt.save(update_fields=["total_marks", "obtained_marks", "percentage"])

        return Response(
            {
                "detail": "Attempt submitted successfully.",
                "attempt_id": attempt.id,
                "test_id": test.id,
                "total_marks": attempt.total_marks,
                "obtained_marks": attempt.obtained_marks,
                "percentage": attempt.percentage,
                "analysis": analysis_payloads,
            },
            status=status.HTTP_201_CREATED,
        )

    def _calculate_percentage(self, obtained_marks: float, total_marks: float) -> float:
        if total_marks <= 0:
            return 0.0

        return round((obtained_marks / total_marks) * 100, 2)

    def _get_user_interests(self, user) -> list[str]:
        """
        Safe profile-interest resolver.
        Works even if the personalization/profile model does not exist.
        """

        possible_attrs = ["interests", "hobbies", "favorite_contexts"]

        for attr in possible_attrs:
            value = getattr(user, attr, None)

            if isinstance(value, list):
                return value

            if isinstance(value, str) and value.strip():
                return [
                    item.strip()
                    for item in value.split(",")
                    if item.strip()
                ]

        profile = getattr(user, "profile", None)

        if profile:
            for attr in possible_attrs:
                value = getattr(profile, attr, None)

                if isinstance(value, list):
                    return value

                if isinstance(value, str) and value.strip():
                    return [
                        item.strip()
                        for item in value.split(",")
                        if item.strip()
                    ]

        return []


class AttemptListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args: Any, **kwargs: Any) -> Response:
        attempts = (
            Attempt.objects.select_related("test", "student")
            .filter(student=request.user)
            .order_by("-created_at")
        )

        serializer = AttemptListSerializer(attempts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AttemptDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id: int, *args: Any, **kwargs: Any) -> Response:
        try:
            attempt = (
                Attempt.objects.select_related("test", "student")
                .prefetch_related(
                    Prefetch(
                        "answers",
                        queryset=AttemptAnswer.objects.select_related("question"),
                    ),
                    "mistakes",
                )
                .get(id=attempt_id, student=request.user)
            )
        except Attempt.DoesNotExist:
            return Response(
                {"detail": "Attempt not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AttemptDetailSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AttemptMistakesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id: int, *args: Any, **kwargs: Any) -> Response:
        try:
            attempt = Attempt.objects.get(id=attempt_id, student=request.user)
        except Attempt.DoesNotExist:
            return Response(
                {"detail": "Attempt not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        mistakes = (
            Mistake.objects.select_related("question", "attempt_answer")
            .filter(attempt=attempt)
            .order_by("id")
        )

        data = [
            {
                "id": mistake.id,
                "question_id": mistake.question_id,
                "question": getattr(mistake.question, "text", ""),
                "student_answer": getattr(mistake.attempt_answer, "student_answer", ""),
                "correct_answer": getattr(mistake.question, "correct_answer", ""),
                "weak_concept": mistake.weak_concept,
                "mistake_type": mistake.mistake_type,
                "explanation": mistake.explanation,
                "personalized_explanation": mistake.personalized_explanation,
                "revision_task": mistake.revision_task,
            }
            for mistake in mistakes
        ]

        return Response(data, status=status.HTTP_200_OK)
