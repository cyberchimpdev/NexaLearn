from __future__ import annotations

from typing import Any

from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.attempts.models import Attempt


EMPTY_REPORT = {
    "summary": {
        "total_attempts": 0,
        "average_score": 0,
        "weak_concepts_count": 0,
        "completed_tests": 0,
    },
    "stats": {
        "total_attempts": 0,
        "average_score": 0,
        "weak_concepts_count": 0,
        "completed_tests": 0,
    },
    "attempts": [],
    "reports": [],
    "weak_concepts": [],
    "mistake_patterns": [],
    "recovery_tasks": [],
}


def safe_attr(obj: Any, names: list[str], default: Any = None) -> Any:
    if obj is None:
        return default

    for name in names:
        try:
            if hasattr(obj, name):
                value = getattr(obj, name)
                if value is not None:
                    return value
        except Exception:
            continue

    return default


def safe_str(value: Any, default: str = "") -> str:
    if value is None:
        return default

    try:
        return str(value)
    except Exception:
        return default


def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except Exception:
        return default


def safe_datetime(value: Any) -> str | None:
    if value is None:
        return None

    try:
        if hasattr(value, "isoformat"):
            return value.isoformat()
        return str(value)
    except Exception:
        return None


def get_model_field_names(model: Any) -> set[str]:
    names: set[str] = set()

    try:
        for field in model._meta.fields:
            names.add(field.name)
    except Exception:
        return set()

    return names


class StudentReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args: Any, **kwargs: Any) -> Response:
        try:
            data = self._build_student_report(request.user)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as exc:
            data = dict(EMPTY_REPORT)

            if getattr(settings, "DEBUG", False):
                data["debug_error"] = str(exc)

            return Response(data, status=status.HTTP_200_OK)

    def _build_student_report(self, user: Any) -> dict[str, Any]:
        field_names = get_model_field_names(Attempt)

        queryset = Attempt.objects.all()

        if "student" in field_names:
            queryset = queryset.filter(student=user)
        elif "user" in field_names:
            queryset = queryset.filter(user=user)
        else:
            return dict(EMPTY_REPORT)

        if "created_at" in field_names:
            queryset = queryset.order_by("-created_at")
        elif "submitted_at" in field_names:
            queryset = queryset.order_by("-submitted_at")
        elif "updated_at" in field_names:
            queryset = queryset.order_by("-updated_at")
        else:
            queryset = queryset.order_by("-id")

        total_attempts = queryset.count()
        completed_tests = 0
        total_percentage = 0.0
        percentage_count = 0

        attempts: list[dict[str, Any]] = []
        weak_concepts: set[str] = set()
        mistake_patterns: dict[str, int] = {}
        recovery_tasks: list[dict[str, Any]] = []

        for attempt in queryset:
            test_obj = safe_attr(attempt, ["test", "test_paper", "quiz"], None)

            subject = safe_str(
                safe_attr(test_obj, ["subject"], safe_attr(attempt, ["subject"], "General")),
                "General",
            )

            topic = safe_str(
                safe_attr(test_obj, ["topic", "chapter"], safe_attr(attempt, ["topic"], "General")),
                "General",
            )

            test_title = safe_str(
                safe_attr(
                    test_obj,
                    ["title", "name"],
                    safe_attr(attempt, ["title"], f"{subject} {topic} Practice Test"),
                ),
                f"{subject} {topic} Practice Test",
            )

            score = safe_float(
                safe_attr(attempt, ["score", "obtained_marks", "marks_obtained"], 0)
            )

            total_marks = safe_float(
                safe_attr(attempt, ["total_marks", "max_marks", "marks", "full_marks"], 0)
            )

            percentage = safe_float(
                safe_attr(attempt, ["percentage", "percent"], 0)
            )

            if percentage <= 0 and total_marks > 0:
                percentage = round((score / total_marks) * 100, 2)

            if percentage > 0:
                total_percentage += percentage
                percentage_count += 1

            attempt_status = safe_str(safe_attr(attempt, ["status"], "completed"), "completed")

            if attempt_status.lower() in {"completed", "submitted", "checked", "evaluated", "done"}:
                completed_tests += 1

            mistakes = self._get_mistakes_from_attempt(
                attempt=attempt,
                fallback_topic=topic,
                weak_concepts=weak_concepts,
                mistake_patterns=mistake_patterns,
            )

            for mistake in mistakes:
                concept = mistake.get("weak_concept") or "General"

                if concept != "General":
                    recovery_tasks.append(
                        {
                            "id": f"{attempt.id}-{mistake.get('id')}",
                            "concept": concept,
                            "task": mistake.get("revision_task")
                            or f"Revise {concept} and solve 3 similar questions.",
                            "status": "pending",
                        }
                    )

            attempts.append(
                {
                    "id": attempt.id,
                    "test_id": safe_attr(test_obj, ["id"], None),
                    "test_title": test_title,
                    "title": test_title,
                    "subject": subject,
                    "topic": topic,
                    "score": score,
                    "obtained_marks": score,
                    "total_marks": total_marks,
                    "percentage": percentage,
                    "status": attempt_status,
                    "created_at": safe_datetime(
                        safe_attr(attempt, ["created_at", "submitted_at", "updated_at"], None)
                    ),
                    "mistakes": mistakes,
                }
            )

        average_score = round(total_percentage / percentage_count, 2) if percentage_count else 0

        return {
            "summary": {
                "total_attempts": total_attempts,
                "average_score": average_score,
                "weak_concepts_count": len(weak_concepts),
                "completed_tests": completed_tests,
            },
            "stats": {
                "total_attempts": total_attempts,
                "average_score": average_score,
                "weak_concepts_count": len(weak_concepts),
                "completed_tests": completed_tests,
            },
            "attempts": attempts,
            "reports": attempts,
            "weak_concepts": sorted(weak_concepts),
            "mistake_patterns": [
                {"type": key, "count": value}
                for key, value in sorted(
                    mistake_patterns.items(),
                    key=lambda item: item[1],
                    reverse=True,
                )
            ],
            "recovery_tasks": recovery_tasks[:12],
        }

    def _get_mistakes_from_attempt(
        self,
        *,
        attempt: Any,
        fallback_topic: str,
        weak_concepts: set[str],
        mistake_patterns: dict[str, int],
    ) -> list[dict[str, Any]]:
        mistakes: list[dict[str, Any]] = []

        relation_names = [
            "mistakes",
            "mistake_set",
            "attempt_mistakes",
            "answers",
            "attempt_answers",
            "attemptanswer_set",
        ]

        for relation_name in relation_names:
            try:
                relation = getattr(attempt, relation_name, None)

                if relation is None:
                    continue

                related_items = relation.all()
            except Exception:
                continue

            for item in related_items:
                try:
                    mistake_type = safe_str(
                        safe_attr(
                            item,
                            ["mistake_type", "type", "error_type", "category"],
                            "concept_gap",
                        ),
                        "concept_gap",
                    )

                    is_correct = safe_attr(item, ["is_correct"], None)

                    if is_correct is True or mistake_type == "correct":
                        continue

                    weak_concept = safe_str(
                        safe_attr(
                            item,
                            ["weak_concept", "concept", "topic", "detected_concept"],
                            fallback_topic or "General",
                        ),
                        fallback_topic or "General",
                    )

                    explanation = safe_str(
                        safe_attr(
                            item,
                            ["explanation", "ai_explanation", "feedback", "what_went_wrong"],
                            "",
                        ),
                        "",
                    )

                    revision_task = safe_str(
                        safe_attr(
                            item,
                            ["revision_task", "recovery_task", "next_task"],
                            "",
                        ),
                        "",
                    )

                    weak_concepts.add(weak_concept)
                    mistake_patterns[mistake_type] = mistake_patterns.get(mistake_type, 0) + 1

                    mistakes.append(
                        {
                            "id": safe_attr(item, ["id"], len(mistakes) + 1),
                            "weak_concept": weak_concept,
                            "mistake_type": mistake_type,
                            "explanation": explanation,
                            "revision_task": revision_task
                            or f"Revise {weak_concept} and solve 3 similar questions.",
                        }
                    )
                except Exception:
                    continue

        return mistakes


class TeacherTestReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, test_id: int, *args: Any, **kwargs: Any) -> Response:
        try:
            data = self._build_teacher_report(test_id)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as exc:
            data = {
                "test_id": test_id,
                "total_attempts": 0,
                "students": [],
            }

            if getattr(settings, "DEBUG", False):
                data["debug_error"] = str(exc)

            return Response(data, status=status.HTTP_200_OK)

    def _build_teacher_report(self, test_id: int) -> dict[str, Any]:
        field_names = get_model_field_names(Attempt)
        queryset = Attempt.objects.all()

        if "test" in field_names:
            queryset = queryset.filter(test_id=test_id)
        elif "test_paper" in field_names:
            queryset = queryset.filter(test_paper_id=test_id)
        elif "quiz" in field_names:
            queryset = queryset.filter(quiz_id=test_id)
        else:
            queryset = queryset.none()

        rows: list[dict[str, Any]] = []

        for attempt in queryset:
            student = safe_attr(attempt, ["student", "user"], None)

            score = safe_float(
                safe_attr(attempt, ["score", "obtained_marks", "marks_obtained"], 0)
            )

            total_marks = safe_float(
                safe_attr(attempt, ["total_marks", "max_marks", "marks"], 0)
            )

            percentage = round((score / total_marks) * 100, 2) if total_marks else 0

            student_name = "Student"

            if student is not None:
                full_name = ""
                try:
                    if hasattr(student, "get_full_name"):
                        full_name = student.get_full_name()
                except Exception:
                    full_name = ""

                student_name = (
                    full_name
                    or safe_str(
                        safe_attr(student, ["full_name", "name", "username", "email"], "Student"),
                        "Student",
                    )
                )

            rows.append(
                {
                    "attempt_id": attempt.id,
                    "student_id": safe_attr(student, ["id"], None),
                    "student_name": student_name,
                    "score": score,
                    "total_marks": total_marks,
                    "percentage": percentage,
                    "created_at": safe_datetime(
                        safe_attr(attempt, ["created_at", "submitted_at"], None)
                    ),
                }
            )

        return {
            "test_id": test_id,
            "total_attempts": queryset.count(),
            "students": rows,
        }
