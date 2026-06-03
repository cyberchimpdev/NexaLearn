from __future__ import annotations

from difflib import SequenceMatcher
from typing import Any

from apps.ai_agent.gemini_client import gemini_client
from apps.ai_agent.prompts import quiz_evaluation_prompt


class AIPracticeEvaluator:
    def evaluate_batch(
        self,
        *,
        questions: list[dict[str, Any]],
        answers: dict[str, str] | list[dict[str, Any]],
        subject: str = "General",
        topic: str = "General",
        student_class: str = "12",
        interests: list[str] | None = None,
    ) -> dict[str, Any]:
        mapped_answers = self._map_answers(answers)

        gemini_result = self._evaluate_with_gemini(
            questions=questions,
            answers=mapped_answers,
            subject=subject,
            topic=topic,
            student_class=student_class,
            interests=interests or [],
        )

        if gemini_result:
            gemini_result["provider"] = "gemini"
            return self._normalize_result(
                data=gemini_result,
                questions=questions,
                answers=mapped_answers,
            )

        fallback = self._fallback_evaluation(
            questions=questions,
            answers=mapped_answers,
        )
        fallback["provider"] = "local"
        return fallback

    def _evaluate_with_gemini(
        self,
        *,
        questions: list[dict[str, Any]],
        answers: dict[str, str],
        subject: str,
        topic: str,
        student_class: str,
        interests: list[str],
    ) -> dict[str, Any] | None:
        prompt = quiz_evaluation_prompt(
            subject=subject,
            topic=topic,
            student_class=student_class,
            interests=interests,
            questions=questions,
            answers=answers,
        )

        data = gemini_client.generate_json_object(prompt)

        if not data:
            return None

        if not isinstance(data.get("results"), list):
            return None

        return data

    def _normalize_result(
        self,
        *,
        data: dict[str, Any],
        questions: list[dict[str, Any]],
        answers: dict[str, str],
    ) -> dict[str, Any]:
        question_map = {
            str(question.get("id", index + 1)): question
            for index, question in enumerate(questions)
        }

        normalized_results: list[dict[str, Any]] = []

        for index, item in enumerate(data.get("results", []), start=1):
            question_id = str(item.get("question_id") or index)
            original_question = question_map.get(question_id, {})

            question_text = (
                item.get("question")
                or original_question.get("question")
                or original_question.get("question_text")
                or original_question.get("text")
                or ""
            )

            correct_answer = (
                item.get("correct_answer")
                or original_question.get("correct_answer")
                or ""
            )

            student_answer = item.get("student_answer")

            if not student_answer or student_answer == "None":
                student_answer = answers.get(question_id, "")

            marks = float(item.get("marks") or original_question.get("marks") or 1)
            marks_awarded = float(item.get("marks_awarded") or 0)

            is_correct = bool(item.get("is_correct", False))

            normalized_results.append(
                {
                    "question_id": int(question_id) if question_id.isdigit() else question_id,
                    "question": question_text,
                    "student_answer": student_answer or "Not available",
                    "correct_answer": correct_answer,
                    "is_correct": is_correct,
                    "marks": marks,
                    "marks_awarded": max(0.0, min(marks_awarded, marks)),
                    "mistake_type": item.get("mistake_type")
                    or ("correct" if is_correct else "concept_gap"),
                    "weak_concept": item.get("weak_concept")
                    or original_question.get("weak_concept")
                    or original_question.get("topic")
                    or "General",
                    "explanation": item.get("explanation")
                    or "Explanation was not available.",
                    "personalized_explanation": item.get("personalized_explanation")
                    or item.get("explanation")
                    or "Personalized explanation was not available.",
                    "revision_task": item.get("revision_task")
                    or "Review the weak concept and solve 3 similar questions.",
                    "next_question_suggestion": item.get("next_question_suggestion")
                    or "Practice one more question from this weak concept.",
                }
            )

        total_questions = len(normalized_results)
        correct_count = sum(1 for item in normalized_results if item["is_correct"])
        total_marks = sum(float(item["marks"]) for item in normalized_results)
        obtained_marks = sum(float(item["marks_awarded"]) for item in normalized_results)

        weak_concepts = sorted(
            {
                item["weak_concept"]
                for item in normalized_results
                if not item["is_correct"]
            }
        )

        data["total_questions"] = total_questions
        data["correct_count"] = correct_count
        data["wrong_count"] = total_questions - correct_count
        data["total_marks"] = total_marks
        data["obtained_marks"] = obtained_marks
        data["percentage"] = round((obtained_marks / total_marks) * 100, 2) if total_marks else 0
        data["weak_concepts"] = weak_concepts
        data["results"] = normalized_results

        if not data.get("overall_feedback"):
            data["overall_feedback"] = self._overall_feedback(correct_count, total_questions)

        if not data.get("recovery_plan"):
            data["recovery_plan"] = [
                "Review each wrong answer.",
                "Revise the weak concept.",
                "Solve 3 similar questions.",
            ]

        return data

    def _fallback_evaluation(
        self,
        *,
        questions: list[dict[str, Any]],
        answers: dict[str, str],
    ) -> dict[str, Any]:
        results: list[dict[str, Any]] = []

        for index, question in enumerate(questions, start=1):
            question_id = str(question.get("id") or index)
            student_answer = answers.get(question_id, "")
            correct_answer = str(question.get("correct_answer", ""))
            marks = float(question.get("marks", 1) or 1)
            similarity = self._similarity(student_answer, correct_answer)

            is_correct = bool(student_answer) and (
                student_answer.strip().lower() == correct_answer.strip().lower()
                or similarity >= 0.85
            )

            mistake_type = "correct" if is_correct else self._mistake_type(
                student_answer,
                similarity,
            )

            weak_concept = (
                "No weak concept detected"
                if is_correct
                else question.get("weak_concept", question.get("topic", "General"))
            )

            explanation = (
                "Your answer is correct."
                if is_correct
                else f"The correct answer is {correct_answer}. Your answer was {student_answer or 'blank'}. Review {weak_concept}."
            )

            results.append(
                {
                    "question_id": int(question_id) if question_id.isdigit() else question_id,
                    "question": question.get("question")
                    or question.get("question_text")
                    or question.get("text")
                    or "",
                    "student_answer": student_answer or "Not available",
                    "correct_answer": correct_answer,
                    "is_correct": is_correct,
                    "marks": marks,
                    "marks_awarded": marks if is_correct else 0.0,
                    "mistake_type": mistake_type,
                    "weak_concept": weak_concept,
                    "explanation": explanation,
                    "personalized_explanation": explanation,
                    "revision_task": self._revision_task(
                        question.get("topic", "this topic"),
                        mistake_type,
                    ),
                    "next_question_suggestion": f"Practice one more question from {weak_concept}.",
                }
            )

        total_questions = len(results)
        correct_count = sum(1 for item in results if item["is_correct"])
        total_marks = sum(float(item["marks"]) for item in results)
        obtained_marks = sum(float(item["marks_awarded"]) for item in results)

        weak_concepts = sorted(
            {
                item["weak_concept"]
                for item in results
                if not item["is_correct"]
            }
        )

        return {
            "total_questions": total_questions,
            "correct_count": correct_count,
            "wrong_count": total_questions - correct_count,
            "total_marks": total_marks,
            "obtained_marks": obtained_marks,
            "percentage": round((obtained_marks / total_marks) * 100, 2)
            if total_marks
            else 0,
            "overall_feedback": self._overall_feedback(correct_count, total_questions),
            "weak_concepts": weak_concepts,
            "strengths": ["Attempted practice questions"] if total_questions else [],
            "recovery_plan": [
                "Review each wrong answer.",
                "Revise the weak concept.",
                "Solve 3 similar questions.",
            ],
            "results": results,
        }

    def _map_answers(
        self,
        answers: dict[str, str] | list[dict[str, Any]],
    ) -> dict[str, str]:
        if isinstance(answers, dict):
            return {str(key): str(value) for key, value in answers.items()}

        mapped: dict[str, str] = {}

        if isinstance(answers, list):
            for item in answers:
                question_id = item.get("question_id") or item.get("id")
                answer = item.get("answer") or item.get("student_answer") or ""

                if question_id is not None:
                    mapped[str(question_id)] = str(answer)

        return mapped

    def _similarity(self, first: str, second: str) -> float:
        if not first or not second:
            return 0.0

        return SequenceMatcher(
            None,
            first.lower().strip(),
            second.lower().strip(),
        ).ratio()

    def _mistake_type(self, student_answer: str, similarity: float) -> str:
        if not student_answer:
            return "unanswered"

        if similarity >= 0.55:
            return "partial_understanding"

        if similarity >= 0.3:
            return "misconception"

        return "concept_gap"

    def _revision_task(self, topic: str, mistake_type: str) -> str:
        if mistake_type == "correct":
            return f"Solve one harder question from {topic}."

        if mistake_type == "unanswered":
            return f"Revise the basic definition of {topic}, then try again."

        if mistake_type == "partial_understanding":
            return f"Review {topic} and focus on exact wording."

        return f"Start from the foundation of {topic} and solve 3 beginner questions."

    def _overall_feedback(self, correct_count: int, total_questions: int) -> str:
        if total_questions == 0:
            return "No questions were submitted."

        percentage = (correct_count / total_questions) * 100

        if percentage >= 80:
            return "Strong performance. Move to harder questions."

        if percentage >= 50:
            return "Good attempt. Review weak concepts and practice more."

        return "You need concept recovery. Start with basics and solve easier questions first."


ai_practice_evaluator = AIPracticeEvaluator()
