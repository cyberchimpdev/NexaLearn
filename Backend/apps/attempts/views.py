from __future__ import annotations

from dataclasses import asdict

from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.ai_agent.schemas import AnswerAnalysisInput
from apps.ai_agent.services import AIAnalysisService
from apps.personalization.models import StudentProfile, StudentStreak
from apps.tests_app.models import Question, Test

from .models import AnswerAttempt, Attempt
from .serializers import AttemptDetailSerializer, SubmitAttemptSerializer


class SubmitAttemptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        if request.user.role != User.Role.STUDENT:
            return Response(
                {"detail": "Only students can submit attempts."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = SubmitAttemptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        test_id = serializer.validated_data["test_id"]
        submitted_answers = serializer.validated_data["answers"]

        try:
            test = Test.objects.prefetch_related("questions").get(id=test_id, is_published=True)
        except Test.DoesNotExist:
            return Response(
                {"detail": "Test not found or not published."},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile, _ = StudentProfile.objects.get_or_create(student=request.user)

        question_map = {
            question.id: question
            for question in test.questions.all()
        }

        attempt = Attempt.objects.create(
            student=request.user,
            test=test,
            total_score=0,
            total_marks=sum(question.marks for question in question_map.values()),
        )

        ai_service = AIAnalysisService()
        total_score = 0

        for submitted in submitted_answers:
            question_id = submitted["question_id"]
            student_answer = submitted.get("student_answer", "")

            question = question_map.get(question_id)

            if not question:
                continue

            ai_payload = AnswerAnalysisInput(
                class_level=test.class_level,
                subject=test.subject,
                topic=test.topic,
                question=question.question_text,
                correct_answer=question.correct_answer,
                student_answer=student_answer,
                marks=question.marks,
                student_interest=profile.primary_interest,
                explanation_style=profile.explanation_style,
            )

            ai_result = ai_service.analyze_answer(ai_payload)
            result_dict = asdict(ai_result)

            total_score += float(result_dict["score"])

            AnswerAttempt.objects.create(
                attempt=attempt,
                question=question,
                student_answer=student_answer,
                is_correct=result_dict["is_correct"],
                score=result_dict["score"],
                mistake_type=result_dict["mistake_type"],
                weak_concept=result_dict["weak_concept"],
                ai_reason=result_dict["reason"],
                correct_solution=result_dict["correct_solution"],
                interest_based_explanation=result_dict["interest_based_explanation"],
                revision_task=result_dict["revision_task"],
            )

        attempt.total_score = total_score
        attempt.save(update_fields=["total_score"])

        streak, _ = StudentStreak.objects.get_or_create(student=request.user)
        streak.mark_activity()

        detail_serializer = AttemptDetailSerializer(attempt)

        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)


class StudentAttemptsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.STUDENT:
            return Response(
                {"detail": "Only students can view attempts."},
                status=status.HTTP_403_FORBIDDEN,
            )

        attempts = (
            Attempt.objects.filter(student=request.user)
            .select_related("test")
            .prefetch_related("answers", "answers__question")
            .order_by("-submitted_at")
        )

        serializer = AttemptDetailSerializer(attempts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AttemptDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            attempt = (
                Attempt.objects.select_related("test", "student")
                .prefetch_related("answers", "answers__question")
                .get(pk=pk)
            )
        except Attempt.DoesNotExist:
            return Response(
                {"detail": "Attempt not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user.role == User.Role.STUDENT and attempt.student_id != request.user.id:
            return Response(
                {"detail": "You cannot view this attempt."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AttemptDetailSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)
