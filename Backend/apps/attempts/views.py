from __future__ import annotations

from dataclasses import asdict

from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.ai_agent.schemas import AnswerAnalysisInput
from apps.ai_agent.services import AIAnalysisService
from apps.personalization.models import StudentProfile
from apps.tests_app.models import Test

from .models import AnswerAttempt, Attempt
from .serializers import (
    AttemptDetailSerializer,
    AttemptListSerializer,
    SubmitAttemptSerializer,
)


class SubmitAttemptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "message": "Use POST to submit a test attempt.",
                "required_format": {
                    "test_id": 1,
                    "answers": [
                        {
                            "question_id": 1,
                            "student_answer": "your answer"
                        }
                    ]
                }
            },
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def post(self, request):
        if request.user.role != User.Role.STUDENT:
            raise PermissionDenied("Only students can submit test attempts.")

        serializer = SubmitAttemptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        test = (
            Test.objects.prefetch_related("questions")
            .filter(id=serializer.validated_data["test_id"], is_published=True)
            .first()
        )

        if test is None:
            raise ValidationError("Test not found.")

        profile, _ = StudentProfile.objects.get_or_create(user=request.user)

        answer_map = {
            item["question_id"]: item["student_answer"]
            for item in serializer.validated_data["answers"]
        }

        total_marks = sum(question.marks for question in test.questions.all())

        attempt = Attempt.objects.create(
            student=request.user,
            test=test,
            total_marks=total_marks,
        )

        ai_service = AIAnalysisService()
        total_score = 0.0

        for question in test.questions.all():
            student_answer = answer_map.get(question.id, "")

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
        attempt.percentage = round((total_score / total_marks) * 100, 2) if total_marks else 0
        attempt.save(update_fields=["total_score", "percentage"])

        output_serializer = AttemptDetailSerializer(attempt)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class StudentAttemptListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AttemptListSerializer

    def get_queryset(self):
        if self.request.user.role != User.Role.STUDENT:
            raise PermissionDenied("Only students can view their attempts.")

        return (
            Attempt.objects.select_related("test", "student")
            .filter(student=self.request.user)
            .order_by("-submitted_at")
        )


class AttemptDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AttemptDetailSerializer

    def get_queryset(self):
        queryset = (
            Attempt.objects.select_related("test", "student")
            .prefetch_related("answers", "answers__question")
            .all()
        )

        if self.request.user.role == User.Role.STUDENT:
            return queryset.filter(student=self.request.user)

        if self.request.user.role == User.Role.TEACHER:
            return queryset.filter(test__created_by=self.request.user)

        return Attempt.objects.none()
