from __future__ import annotations

import json
import os
from typing import Any


class QuizGenerationService:
    def generate_quiz(
        self,
        *,
        subject: str,
        topic: str,
        class_level: str,
        difficulty: str,
        question_count: int,
        marks_per_question: int,
    ) -> dict[str, Any]:
        try:
            return self._generate_with_gemini(
                subject=subject,
                topic=topic,
                class_level=class_level,
                difficulty=difficulty,
                question_count=question_count,
                marks_per_question=marks_per_question,
            )
        except Exception:
            return self._generate_locally(
                subject=subject,
                topic=topic,
                class_level=class_level,
                difficulty=difficulty,
                question_count=question_count,
                marks_per_question=marks_per_question,
            )

    def _generate_with_gemini(
        self,
        *,
        subject: str,
        topic: str,
        class_level: str,
        difficulty: str,
        question_count: int,
        marks_per_question: int,
    ) -> dict[str, Any]:
        api_key = os.getenv("GEMINI_API_KEY")
        model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

        if not api_key:
            raise ValueError("GEMINI_API_KEY missing.")

        from google import genai

        client = genai.Client(api_key=api_key)

        prompt = f"""
Generate a diagnostic quiz for NexaLearn.

Return ONLY valid JSON. No markdown. No explanation outside JSON.

Context:
Subject: {subject}
Topic: {topic}
Class level: {class_level}
Difficulty: {difficulty}
Question count: {question_count}
Marks per question: {marks_per_question}

JSON format:
{{
  "title": "Class {class_level} {topic} Diagnostic Test",
  "subject": "{subject}",
  "topic": "{topic}",
  "class_level": "{class_level}",
  "difficulty": "{difficulty}",
  "description": "Short diagnostic test to detect weak concepts.",
  "is_published": false,
  "questions": [
    {{
      "question_text": "Question text",
      "correct_answer": "Correct answer",
      "marks": {marks_per_question},
      "difficulty": "{difficulty}",
      "order": 1
    }}
  ]
}}

Rules:
- Questions must detect conceptual, formula, calculation, or unit mistakes.
- Correct answers must be short but clear.
- Use class-appropriate language.
- Do not create multiple-choice questions unless required.
"""

        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )

        text = getattr(response, "text", "")
        cleaned = text.strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned)

        return self._normalize_quiz(
            data=data,
            subject=subject,
            topic=topic,
            class_level=class_level,
            difficulty=difficulty,
            question_count=question_count,
            marks_per_question=marks_per_question,
        )

    def _generate_locally(
        self,
        *,
        subject: str,
        topic: str,
        class_level: str,
        difficulty: str,
        question_count: int,
        marks_per_question: int,
    ) -> dict[str, Any]:
        templates = [
            f"Define {topic}.",
            f"State the main formula or rule related to {topic}.",
            f"Explain one common mistake students make in {topic}.",
            f"Solve one short problem based on {topic}.",
            f"Write one real-life example of {topic}.",
        ]

        questions = []

        for index in range(question_count):
            question_text = templates[index % len(templates)]

            questions.append(
                {
                    "question_text": question_text,
                    "correct_answer": self._local_answer(topic, question_text),
                    "marks": marks_per_question,
                    "difficulty": difficulty,
                    "order": index + 1,
                }
            )

        return {
            "title": f"Class {class_level} {topic} Diagnostic Test",
            "subject": subject,
            "topic": topic,
            "class_level": class_level,
            "difficulty": difficulty,
            "description": "AI-generated diagnostic test to detect weak concepts.",
            "is_published": False,
            "questions": questions,
        }

    def _local_answer(self, topic: str, question: str) -> str:
        lowered = question.lower()

        if "define" in lowered:
            return f"{topic} is a key concept in this subject. Explain its meaning clearly."

        if "formula" in lowered or "rule" in lowered:
            return f"Write the correct formula/rule for {topic} and explain each term."

        if "mistake" in lowered:
            return f"A common mistake in {topic} is using the wrong concept, formula, or unit."

        if "real-life" in lowered:
            return f"Give a relevant daily-life example connected to {topic}."

        return f"Solve using the correct concept of {topic}."

    def _normalize_quiz(
        self,
        *,
        data: dict[str, Any],
        subject: str,
        topic: str,
        class_level: str,
        difficulty: str,
        question_count: int,
        marks_per_question: int,
    ) -> dict[str, Any]:
        questions = data.get("questions", [])

        normalized_questions = []
        for index, question in enumerate(questions[:question_count]):
            normalized_questions.append(
                {
                    "question_text": str(question.get("question_text", "")).strip(),
                    "correct_answer": str(question.get("correct_answer", "")).strip(),
                    "marks": int(question.get("marks", marks_per_question)),
                    "difficulty": str(question.get("difficulty", difficulty)),
                    "order": index + 1,
                }
            )

        return {
            "title": data.get("title") or f"Class {class_level} {topic} Diagnostic Test",
            "subject": data.get("subject") or subject,
            "topic": data.get("topic") or topic,
            "class_level": data.get("class_level") or class_level,
            "difficulty": data.get("difficulty") or difficulty,
            "description": data.get("description")
            or "AI-generated diagnostic test to detect weak concepts.",
            "is_published": bool(data.get("is_published", False)),
            "questions": normalized_questions,
        }
