from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AnswerAnalysisInput:
    class_level: str
    subject: str
    topic: str
    question: str
    correct_answer: str
    student_answer: str
    marks: int
    student_interest: str = "real_life"
    explanation_style: str = "step_by_step"


@dataclass(frozen=True)
class AnswerAnalysisOutput:
    is_correct: bool
    score: float
    mistake_type: str
    weak_concept: str
    reason: str
    correct_solution: str
    interest_based_explanation: str
    revision_task: str
