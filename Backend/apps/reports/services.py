from __future__ import annotations

from collections import Counter, defaultdict

from apps.attempts.models import AnswerAttempt, Attempt
from apps.tests_app.models import Test

from .models import ClassReportSnapshot, RemedialGroup


class ReportService:
    @staticmethod
    def generate_teacher_action(mistake_type: str, weak_concept: str) -> str:
        if not mistake_type or mistake_type == "No mistake":
            return "Most students performed well. Give 2 advanced practice questions."

        if mistake_type == "Formula mistake":
            return (
                f"Revise the formula related to {weak_concept}. "
                "Show one solved example, then give 3 similar numerical questions."
            )

        if mistake_type == "Calculation mistake":
            return (
                f"Give calculation practice for {weak_concept}. "
                "Ask students to write every substitution step and final unit."
            )

        if mistake_type == "Unit mistake":
            return (
                f"Create a quick unit revision table for {weak_concept}. "
                "Then give 3 unit-conversion or final-answer questions."
            )

        if mistake_type == "Conceptual mistake":
            return (
                f"Reteach the core idea of {weak_concept} using a real-life, cricket, "
                "anime, or gaming example based on student interests."
            )

        if mistake_type == "Incomplete answer":
            return (
                f"Show students how to write a complete answer for {weak_concept}: "
                "definition, formula/concept, example, and final conclusion."
            )

        return (
            f"Create a short remedial activity for {weak_concept} and ask students "
            "to explain the concept in their own words."
        )

    @classmethod
    def build_class_report(cls, test: Test) -> dict:
        attempts = (
            Attempt.objects.select_related("student", "test")
            .filter(test=test)
            .order_by("-submitted_at")
        )

        total_attempts = attempts.count()

        average_score = (
            round(sum(attempt.total_score for attempt in attempts) / total_attempts, 2)
            if total_attempts
            else 0
        )

        average_percentage = (
            round(sum(attempt.percentage for attempt in attempts) / total_attempts, 2)
            if total_attempts
            else 0
        )

        answers = (
            AnswerAttempt.objects.select_related(
                "attempt",
                "attempt__student",
                "question",
            )
            .filter(attempt__test=test)
        )

        weak_counter: Counter[str] = Counter()
        mistake_counter: Counter[str] = Counter()

        for answer in answers:
            if answer.mistake_type != "No mistake":
                weak_counter[answer.weak_concept] += 1
                mistake_counter[answer.mistake_type] += 1

        most_common_weak_concept = (
            weak_counter.most_common(1)[0][0] if weak_counter else ""
        )
        most_common_mistake_type = (
            mistake_counter.most_common(1)[0][0] if mistake_counter else ""
        )

        suggested_action = cls.generate_teacher_action(
            most_common_mistake_type,
            most_common_weak_concept,
        )

        snapshot, _ = ClassReportSnapshot.objects.update_or_create(
            test=test,
            defaults={
                "total_attempts": total_attempts,
                "average_score": average_score,
                "average_percentage": average_percentage,
                "most_common_weak_concept": most_common_weak_concept,
                "most_common_mistake_type": most_common_mistake_type,
                "suggested_teacher_action": suggested_action,
            },
        )

        student_results = [
            {
                "attempt_id": attempt.id,
                "student_id": attempt.student.id,
                "student_name": attempt.student.full_name,
                "student_email": attempt.student.email,
                "score": attempt.total_score,
                "total_marks": attempt.total_marks,
                "percentage": attempt.percentage,
                "submitted_at": attempt.submitted_at,
            }
            for attempt in attempts
        ]

        return {
            "snapshot": snapshot,
            "student_results": student_results,
        }

    @classmethod
    def build_weakness_heatmap(cls, test: Test) -> dict:
        answers = (
            AnswerAttempt.objects.select_related(
                "attempt",
                "attempt__student",
                "question",
            )
            .filter(attempt__test=test)
        )

        weak_counter: Counter[str] = Counter()
        mistake_counter: Counter[str] = Counter()
        question_counter: Counter[str] = Counter()

        for answer in answers:
            if answer.mistake_type == "No mistake":
                continue

            weak_counter[answer.weak_concept] += 1
            mistake_counter[answer.mistake_type] += 1
            question_counter[f"Q{answer.question.order}: {answer.question.question_text}"] += 1

        return {
            "weak_topics": [
                {"weak_concept": key, "count": value}
                for key, value in weak_counter.most_common()
            ],
            "mistake_types": [
                {"mistake_type": key, "count": value}
                for key, value in mistake_counter.most_common()
            ],
            "question_difficulty": [
                {"question": key, "wrong_count": value}
                for key, value in question_counter.most_common()
            ],
        }

    @classmethod
    def build_remedial_groups(cls, test: Test) -> list[dict]:
        answers = (
            AnswerAttempt.objects.select_related(
                "attempt",
                "attempt__student",
                "question",
            )
            .filter(attempt__test=test)
            .order_by("question__order")
        )

        grouped: defaultdict[str, list[AnswerAttempt]] = defaultdict(list)

        for answer in answers:
            if answer.mistake_type == "No mistake":
                continue

            key = f"{answer.mistake_type}|{answer.weak_concept}"
            grouped[key].append(answer)

        RemedialGroup.objects.filter(test=test).delete()

        formatted_groups: list[dict] = []

        for key, grouped_answers in grouped.items():
            mistake_type, weak_concept = key.split("|", 1)

            group_name = f"{mistake_type} in {weak_concept}"
            suggested_action = cls.generate_teacher_action(mistake_type, weak_concept)

            group = RemedialGroup.objects.create(
                test=test,
                group_name=group_name,
                mistake_type=mistake_type,
                weak_concept=weak_concept,
                suggested_action=suggested_action,
                student_count=len(grouped_answers),
            )

            students = []
            seen_students = set()

            for answer in grouped_answers:
                student_key = answer.attempt.student_id

                if student_key in seen_students:
                    continue

                seen_students.add(student_key)

                students.append(
                    {
                        "student_id": answer.attempt.student.id,
                        "student_name": answer.attempt.student.full_name,
                        "student_email": answer.attempt.student.email,
                        "question_text": answer.question.question_text,
                        "student_answer": answer.student_answer,
                        "revision_task": answer.revision_task,
                    }
                )

            formatted_groups.append(
                {
                    "id": group.id,
                    "group_name": group.group_name,
                    "mistake_type": group.mistake_type,
                    "weak_concept": group.weak_concept,
                    "suggested_action": group.suggested_action,
                    "student_count": len(students),
                    "students": students,
                }
            )

        return formatted_groups
