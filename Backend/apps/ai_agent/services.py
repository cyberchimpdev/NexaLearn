from __future__ import annotations

from dataclasses import asdict
from typing import Any

from .schemas import AnswerAnalysisInput


class AIAnalysisService:
    """
    Service layer for NexaLearn AI analysis.

    This keeps views.py clean and gives one stable interface for:
    - answer analysis
    - mistake diagnosis
    - personalized explanation
    - quiz generation
    """

    def analyze_answer(self, payload: dict[str, Any]) -> dict[str, Any]:
        analysis_input = AnswerAnalysisInput.from_dict(payload)

        question_text = analysis_input.question_text
        correct_answer = analysis_input.correct_answer
        student_answer = analysis_input.student_answer

        is_blank = not student_answer.strip()
        is_exact_match = (
            student_answer.strip().lower() == correct_answer.strip().lower()
            if correct_answer
            else False
        )

        score = self._calculate_score(
            student_answer=student_answer,
            correct_answer=correct_answer,
        )

        mistake_type = self._detect_mistake_type(
            student_answer=student_answer,
            correct_answer=correct_answer,
            is_blank=is_blank,
            is_exact_match=is_exact_match,
        )

        weak_concept = self._detect_weak_concept(
            question_text=question_text,
            topic=analysis_input.topic,
            mistake_type=mistake_type,
        )

        explanation = self._generate_personalized_explanation(
            analysis_input=analysis_input,
            mistake_type=mistake_type,
            weak_concept=weak_concept,
            score=score,
        )

        revision_tasks = self._generate_revision_tasks(
            topic=analysis_input.topic,
            weak_concept=weak_concept,
            mistake_type=mistake_type,
        )

        return {
            "input": asdict(analysis_input),
            "score": score,
            "is_correct": score >= 80,
            "mistake_type": mistake_type,
            "weak_concept": weak_concept,
            "explanation": explanation,
            "revision_tasks": revision_tasks,
            "next_step": self._next_step(score),
        }

    def generate_quiz(self, payload: dict[str, Any]) -> dict[str, Any]:
        subject = str(payload.get("subject", "General")).strip() or "General"
        topic = str(payload.get("topic", "General")).strip() or "General"
        grade_level = str(payload.get("grade_level", "General")).strip() or "General"

        try:
            total_questions = int(payload.get("total_questions", 5))
        except (TypeError, ValueError):
            total_questions = 5

        total_questions = max(1, min(total_questions, 10))

        questions = [
            {
                "id": index + 1,
                "question_text": f"{topic}: practice question {index + 1} for {grade_level}.",
                "question_type": "short_answer",
                "marks": 2,
                "correct_answer": f"Key concept answer for {topic} question {index + 1}.",
                "explanation": f"This question checks understanding of {topic} in {subject}.",
            }
            for index in range(total_questions)
        ]

        return {
            "subject": subject,
            "topic": topic,
            "grade_level": grade_level,
            "total_questions": total_questions,
            "questions": questions,
        }

    def chat(self, payload: dict[str, Any]) -> dict[str, Any]:
        message = str(payload.get("message", "")).strip()
        subject = str(payload.get("subject", "General")).strip() or "General"
        topic = str(payload.get("topic", "General")).strip() or "General"

        if not message:
            return {
                "reply": "Please ask a clear question so I can explain it step by step.",
                "subject": subject,
                "topic": topic,
            }

        return {
            "reply": (
                f"Here is a simple explanation for your doubt in {subject}"
                f"{f' / {topic}' if topic != 'General' else ''}: {message}\n\n"
                "1. First, identify the main concept.\n"
                "2. Break the question into smaller parts.\n"
                "3. Connect it with an example you already understand.\n"
                "4. Practice one similar question to confirm understanding."
            ),
            "subject": subject,
            "topic": topic,
        }

    def _calculate_score(self, student_answer: str, correct_answer: str) -> int:
        student = student_answer.strip().lower()
        correct = correct_answer.strip().lower()

        if not student:
            return 0

        if not correct:
            return 50

        if student == correct:
            return 100

        correct_words = set(correct.split())
        student_words = set(student.split())

        if not correct_words:
            return 50

        overlap = len(correct_words.intersection(student_words))
        score = int((overlap / len(correct_words)) * 100)

        return max(10, min(score, 95))

    def _detect_mistake_type(
        self,
        student_answer: str,
        correct_answer: str,
        is_blank: bool,
        is_exact_match: bool,
    ) -> str:
        if is_blank:
            return "blank_answer"

        if is_exact_match:
            return "correct"

        student = student_answer.strip().lower()
        correct = correct_answer.strip().lower()

        if len(student.split()) <= 3 and len(correct.split()) > 6:
            return "incomplete_answer"

        if student and correct and student in correct:
            return "partial_understanding"

        return "conceptual_gap"

    def _detect_weak_concept(
        self,
        question_text: str,
        topic: str,
        mistake_type: str,
    ) -> str:
        if mistake_type == "correct":
            return "No major weak concept detected"

        if topic and topic.lower() != "general":
            return topic

        words = question_text.split()
        if len(words) >= 4:
            return " ".join(words[:4])

        return "Core concept understanding"

    def _generate_personalized_explanation(
        self,
        analysis_input: AnswerAnalysisInput,
        mistake_type: str,
        weak_concept: str,
        score: int,
    ) -> str:
        interests = analysis_input.interests or []
        interest_context = interests[0] if interests else "real-life examples"

        if mistake_type == "correct":
            return (
                f"Good work. Your answer matches the expected concept. "
                f"To strengthen it further, explain the same idea using {interest_context}."
            )

        if mistake_type == "blank_answer":
            return (
                f"You left this answer blank. Start by writing the basic definition of "
                f"{weak_concept}, then add one example. Think of it through {interest_context} "
                f"so the concept feels easier to connect with."
            )

        if mistake_type == "incomplete_answer":
            return (
                f"Your answer shows a start, but it is incomplete. For {weak_concept}, "
                f"include the definition, key point, and one example. Current score: {score}/100."
            )

        if mistake_type == "partial_understanding":
            return (
                f"You understood part of {weak_concept}, but missed important details. "
                f"Revise the full concept and compare your answer with the correct answer line by line."
            )

        return (
            f"There is a conceptual gap in {weak_concept}. First learn the core meaning, "
            f"then solve two similar examples. Use {interest_context} as your learning context."
        )

    def _generate_revision_tasks(
        self,
        topic: str,
        weak_concept: str,
        mistake_type: str,
    ) -> list[dict[str, str]]:
        if mistake_type == "correct":
            return [
                {
                    "type": "challenge",
                    "task": f"Solve one higher-level question from {topic or weak_concept}.",
                }
            ]

        return [
            {
                "type": "review",
                "task": f"Revise the core concept of {weak_concept}.",
            },
            {
                "type": "practice",
                "task": f"Write the correct answer for {topic or weak_concept} in your own words.",
            },
            {
                "type": "reflection",
                "task": "Add this mistake to your mistake notebook with reason and correction.",
            },
        ]

    def _next_step(self, score: int) -> str:
        if score >= 80:
            return "Move to a harder question."
        if score >= 50:
            return "Revise the missing points and retry one similar question."
        return "Relearn the concept from basics before attempting another question."
