from __future__ import annotations

import random
from typing import Any

from apps.ai_agent.gemini_client import gemini_client
from apps.ai_agent.prompts import quiz_generation_prompt


class AIPracticeQuizGenerator:
    def generate_quiz(
        self,
        *,
        subject: str,
        topic: str,
        student_class: str = "12",
        difficulty: str = "medium",
        total_questions: int = 5,
        marks_per_question: int = 2,
        interests: list[str] | None = None,
    ) -> dict[str, Any]:
        total_questions = max(1, min(int(total_questions or 5), 20))
        marks_per_question = max(1, min(int(marks_per_question or 2), 10))
        safe_interests = interests or []

        questions = self._generate_with_gemini(
            subject=subject,
            topic=topic,
            student_class=student_class,
            difficulty=difficulty,
            total_questions=total_questions,
            marks_per_question=marks_per_question,
            interests=safe_interests,
        )

        provider = "gemini"
        gemini_error = ""

        if not questions:
            provider = "local"
            gemini_error = gemini_client.last_error or "Gemini failed. Local fallback used."
            questions = self._fallback_questions(
                subject=subject,
                topic=topic,
                student_class=student_class,
                difficulty=difficulty,
                total_questions=total_questions,
                marks_per_question=marks_per_question,
            )

        return {
            "provider": provider,
            "source": provider,
            "gemini_error": gemini_error,
            "gemini_model": gemini_client.last_model,
            "tried_models": gemini_client.last_tried_models,
            "title": f"{subject} {topic} Practice Test",
            "description": "Answer the questions and submit to get AI-powered feedback.",
            "subject": subject,
            "topic": topic,
            "class_level": student_class,
            "student_class": student_class,
            "difficulty": difficulty,
            "total_questions": len(questions),
            "marks_per_question": marks_per_question,
            "total_marks": len(questions) * marks_per_question,
            "questions": questions,
        }

    def _generate_with_gemini(
        self,
        *,
        subject: str,
        topic: str,
        student_class: str,
        difficulty: str,
        total_questions: int,
        marks_per_question: int,
        interests: list[str],
    ) -> list[dict[str, Any]] | None:
        prompt = quiz_generation_prompt(
            subject=subject,
            topic=topic,
            student_class=student_class,
            difficulty=difficulty,
            total_questions=total_questions,
            marks_per_question=marks_per_question,
            interests=interests,
        )

        data = gemini_client.generate_json_list(prompt)

        if not data:
            return None

        questions: list[dict[str, Any]] = []

        for index, item in enumerate(data[:total_questions], start=1):
            question_text = str(item.get("question", "")).strip()
            options = item.get("options", [])
            correct_answer = str(item.get("correct_answer", "")).strip()

            if not question_text or not isinstance(options, list):
                continue

            options = [str(option).strip() for option in options if str(option).strip()]
            options = options[:4]

            if len(options) < 2:
                continue

            if correct_answer not in options:
                correct_answer = options[0]

            questions.append(
                {
                    "id": index,
                    "order": index,
                    "question": question_text,
                    "question_text": question_text,
                    "text": question_text,
                    "options": options,
                    "correct_answer": correct_answer,
                    "explanation": str(item.get("explanation", "")).strip()
                    or f"The correct answer is {correct_answer}.",
                    "weak_concept": str(item.get("weak_concept", topic)).strip() or topic,
                    "hint": str(item.get("hint", "")).strip(),
                    "difficulty_reason": str(item.get("difficulty_reason", "")).strip(),
                    "subject": subject,
                    "topic": topic,
                    "class_level": student_class,
                    "student_class": student_class,
                    "difficulty": difficulty,
                    "marks": marks_per_question,
                }
            )

        return questions or None

    def _fallback_questions(
        self,
        *,
        subject: str,
        topic: str,
        student_class: str,
        difficulty: str,
        total_questions: int,
        marks_per_question: int,
    ) -> list[dict[str, Any]]:
        templates = [
            {
                "question": f"What is the main concept of {topic} in {subject}?",
                "options": [
                    f"Understanding the concept of {topic}",
                    "Ignoring examples",
                    "Only memorizing random words",
                    "Skipping practice",
                ],
                "correct_answer": f"Understanding the concept of {topic}",
                "explanation": f"{topic} becomes easier when the core concept is clear.",
                "weak_concept": topic,
            },
            {
                "question": f"Which method is best for learning {topic}?",
                "options": [
                    "Understand, practice, and review mistakes",
                    "Only copy answers",
                    "Avoid solving questions",
                    "Guess without reading",
                ],
                "correct_answer": "Understand, practice, and review mistakes",
                "explanation": "The best learning cycle is concept understanding, practice, and mistake review.",
                "weak_concept": "Learning strategy",
            },
            {
                "question": f"Why should students review mistakes in {topic}?",
                "options": [
                    "To identify weak concepts",
                    "To waste time",
                    "To avoid study",
                    "To memorize random options",
                ],
                "correct_answer": "To identify weak concepts",
                "explanation": "Mistakes show which concept needs revision.",
                "weak_concept": "Weak concept detection",
            },
        ]

        questions: list[dict[str, Any]] = []

        for index in range(1, total_questions + 1):
            item = random.choice(templates)
            question_text = f"{item['question']} #{index}"

            questions.append(
                {
                    "id": index,
                    "order": index,
                    "question": question_text,
                    "question_text": question_text,
                    "text": question_text,
                    "options": item["options"],
                    "correct_answer": item["correct_answer"],
                    "explanation": item["explanation"],
                    "weak_concept": item["weak_concept"],
                    "hint": f"Focus on the main idea of {topic}.",
                    "difficulty_reason": f"This is a {difficulty} level fallback question.",
                    "subject": subject,
                    "topic": topic,
                    "class_level": student_class,
                    "student_class": student_class,
                    "difficulty": difficulty,
                    "marks": marks_per_question,
                }
            )

        return questions


ai_practice_quiz_generator = AIPracticeQuizGenerator()
