from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class AnswerAnalysisInput:
    question_text: str
    correct_answer: str
    student_answer: str
    subject: str = "General"
    topic: str = "General"
    grade_level: str = "General"
    learning_style: str = "simple"
    interests: list[str] | None = None

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "AnswerAnalysisInput":
        interests = data.get("interests")

        return cls(
            question_text=str(data.get("question_text", "")).strip(),
            correct_answer=str(data.get("correct_answer", "")).strip(),
            student_answer=str(data.get("student_answer", "")).strip(),
            subject=str(data.get("subject", "General")).strip() or "General",
            topic=str(data.get("topic", "General")).strip() or "General",
            grade_level=str(data.get("grade_level", "General")).strip() or "General",
            learning_style=str(data.get("learning_style", "simple")).strip() or "simple",
            interests=interests if isinstance(interests, list) else [],
        )
