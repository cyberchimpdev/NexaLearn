# apps/reports/services.py

from __future__ import annotations

from collections import Counter, defaultdict
from typing import Any

from django.db.models import Avg, Count, QuerySet

from apps.attempts.models import Attempt, AttemptAnswer, Mistake


class ReportService:
    """
    Report service for NexaLearn.

    Generates:
    - student attempt history
    - weak concept summary
    - mistake type summary
    - teacher test report
    - remedial groups
    """

    @staticmethod
    def get_student_report(student) -> dict[str, Any]:
        attempts = (
            Attempt.objects.select_related("test", "student")
            .prefetch_related("mistakes", "answers")
            .filter(student=student)
            .order_by("-created_at")
        )

        total_attempts = attempts.count()

        average_percentage = (
            attempts.aggregate(avg_percentage=Avg("percentage"))["avg_percentage"] or 0
        )

        weak_concepts = (
            Mistake.objects.filter(attempt__student=student)
            .values("weak_concept")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        mistake_types = (
            Mistake.objects.filter(attempt__student=student)
            .values("mistake_type")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        recent_attempts = [
            {
                "id": attempt.id,
                "test_id": attempt.test_id,
                "test_title": attempt.test.title,
                "obtained_marks": attempt.obtained_marks,
                "total_marks": attempt.total_marks,
                "percentage": attempt.percentage,
                "created_at": attempt.created_at,
            }
            for attempt in attempts[:10]
        ]

        return {
            "total_attempts": total_attempts,
            "average_percentage": round(float(average_percentage), 2),
            "weak_concepts": list(weak_concepts),
            "mistake_types": list(mistake_types),
            "recent_attempts": recent_attempts,
        }

    @staticmethod
    def get_test_report(test, teacher=None) -> dict[str, Any]:
        attempts = (
            Attempt.objects.select_related("student", "test")
            .prefetch_related("mistakes", "answers")
            .filter(test=test)
            .order_by("-created_at")
        )

        if teacher is not None:
            created_by = getattr(test, "created_by", None)
            if created_by is not None and created_by != teacher:
                return {
                    "detail": "You do not have permission to view this report.",
                    "allowed": False,
                }

        total_attempts = attempts.count()

        average_percentage = (
            attempts.aggregate(avg_percentage=Avg("percentage"))["avg_percentage"] or 0
        )

        student_rows = [
            {
                "attempt_id": attempt.id,
                "student_id": attempt.student_id,
                "student_name": ReportService._get_user_display_name(attempt.student),
                "student_email": getattr(attempt.student, "email", ""),
                "obtained_marks": attempt.obtained_marks,
                "total_marks": attempt.total_marks,
                "percentage": attempt.percentage,
                "created_at": attempt.created_at,
            }
            for attempt in attempts
        ]

        weak_concepts = (
            Mistake.objects.filter(attempt__test=test)
            .values("weak_concept")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        mistake_types = (
            Mistake.objects.filter(attempt__test=test)
            .values("mistake_type")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        remedial_groups = ReportService.get_remedial_groups_for_test(test)

        return {
            "allowed": True,
            "test_id": test.id,
            "test_title": test.title,
            "total_attempts": total_attempts,
            "average_percentage": round(float(average_percentage), 2),
            "students": student_rows,
            "weak_concepts": list(weak_concepts),
            "mistake_types": list(mistake_types),
            "remedial_groups": remedial_groups,
        }

    @staticmethod
    def get_remedial_groups_for_test(test) -> list[dict[str, Any]]:
        mistakes = (
            Mistake.objects.select_related(
                "attempt",
                "attempt__student",
                "question",
            )
            .filter(attempt__test=test)
            .order_by("weak_concept")
        )

        grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)

        for mistake in mistakes:
            weak_concept = mistake.weak_concept or "Uncategorized"

            grouped[weak_concept].append(
                {
                    "student_id": mistake.attempt.student_id,
                    "student_name": ReportService._get_user_display_name(
                        mistake.attempt.student
                    ),
                    "student_email": getattr(mistake.attempt.student, "email", ""),
                    "mistake_type": mistake.mistake_type,
                    "question": getattr(mistake.question, "text", ""),
                    "revision_task": mistake.revision_task,
                }
            )

        return [
            {
                "weak_concept": weak_concept,
                "student_count": len({item["student_id"] for item in students}),
                "students": students,
            }
            for weak_concept, students in grouped.items()
        ]

    @staticmethod
    def get_class_performance_for_teacher(teacher) -> dict[str, Any]:
        attempts = (
            Attempt.objects.select_related("test", "student")
            .filter(test__created_by=teacher)
            .order_by("-created_at")
        )

        total_attempts = attempts.count()

        average_percentage = (
            attempts.aggregate(avg_percentage=Avg("percentage"))["avg_percentage"] or 0
        )

        tests_summary = (
            attempts.values("test_id", "test__title")
            .annotate(
                attempt_count=Count("id"),
                average_percentage=Avg("percentage"),
            )
            .order_by("-attempt_count")
        )

        return {
            "total_attempts": total_attempts,
            "average_percentage": round(float(average_percentage), 2),
            "tests": [
                {
                    "test_id": row["test_id"],
                    "test_title": row["test__title"],
                    "attempt_count": row["attempt_count"],
                    "average_percentage": round(
                        float(row["average_percentage"] or 0),
                        2,
                    ),
                }
                for row in tests_summary
            ],
        }

    @staticmethod
    def get_student_mistake_cards(student) -> list[dict[str, Any]]:
        mistakes = (
            Mistake.objects.select_related(
                "attempt",
                "attempt__test",
                "question",
                "attempt_answer",
            )
            .filter(attempt__student=student)
            .order_by("-created_at")
        )

        return [
            {
                "id": mistake.id,
                "test_id": mistake.attempt.test_id,
                "test_title": mistake.attempt.test.title,
                "question": getattr(mistake.question, "text", ""),
                "student_answer": getattr(mistake.attempt_answer, "student_answer", ""),
                "correct_answer": getattr(mistake.question, "correct_answer", ""),
                "weak_concept": mistake.weak_concept,
                "mistake_type": mistake.mistake_type,
                "explanation": mistake.explanation,
                "personalized_explanation": mistake.personalized_explanation,
                "revision_task": mistake.revision_task,
                "created_at": mistake.created_at,
            }
            for mistake in mistakes
        ]

    @staticmethod
    def _get_user_display_name(user) -> str:
        full_name = ""

        if hasattr(user, "get_full_name"):
            full_name = user.get_full_name()

        if full_name:
            return full_name

        username = getattr(user, "username", "")

        if username:
            return username

        email = getattr(user, "email", "")

        return email or "Unknown Student"
