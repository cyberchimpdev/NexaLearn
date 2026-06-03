from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class AnswerAnalysisInput:
    question_text: str
    correct_answer: str
    student_answer: str
    subject: str = "General"
    topic: str = "General"
    difficulty: str = "medium"
    question_type: str = "short_answer"
    marks: int = 1
    student_class: str | None = None
    learning_style: str | None = None
    interests: list[str] = field(default_factory=list)


@dataclass(slots=True)
class AnswerAnalysisResult:
    is_correct: bool
    score_awarded: float
    max_score: float
    weak_concept: str
    mistake_type: str
    explanation: str
    personalized_explanation: str
    revision_task: str
    confidence: float = 0.85
    provider: str = "local"

    def to_dict(self) -> dict[str, Any]:
        return {
            "is_correct": self.is_correct,
            "score_awarded": self.score_awarded,
            "max_score": self.max_score,
            "weak_concept": self.weak_concept,
            "mistake_type": self.mistake_type,
            "explanation": self.explanation,
            "personalized_explanation": self.personalized_explanation,
            "revision_task": self.revision_task,
            "confidence": self.confidence,
            "provider": self.provider,
        }


@dataclass(slots=True)
class ChatInput:
    message: str
    subject: str = "General"
    topic: str = "General"
    student_class: str | None = None
    learning_style: str | None = None
    interests: list[str] = field(default_factory=list)
