from __future__ import annotations

import re
from difflib import SequenceMatcher

from apps.ai_agent.gemini_client import gemini_client
from apps.ai_agent.prompts import answer_analysis_prompt
from apps.ai_agent.schemas import AnswerAnalysisInput, AnswerAnalysisResult


class LocalLearningAgent:
    def analyze_answer(self, payload: AnswerAnalysisInput) -> AnswerAnalysisResult:
        gemini_result = self._analyze_with_gemini(payload)

        if gemini_result:
            return gemini_result

        return self._fallback_analysis(payload)

    def _analyze_with_gemini(self, payload: AnswerAnalysisInput) -> AnswerAnalysisResult | None:
        prompt = answer_analysis_prompt(
            question_text=payload.question_text,
            correct_answer=payload.correct_answer,
            student_answer=payload.student_answer,
            subject=payload.subject,
            topic=payload.topic,
            difficulty=payload.difficulty,
            question_type=payload.question_type,
            marks=payload.marks,
            student_class=payload.student_class,
            learning_style=payload.learning_style,
            interests=payload.interests,
        )

        data = gemini_client.generate_json_object(prompt)

        if not data:
            return None

        try:
            max_score = float(data.get("max_score", payload.marks or 1))
            score_awarded = float(data.get("score_awarded", 0))

            return AnswerAnalysisResult(
                is_correct=bool(data.get("is_correct", False)),
                score_awarded=max(0.0, min(score_awarded, max_score)),
                max_score=max_score,
                weak_concept=str(data.get("weak_concept", payload.topic or "General")),
                mistake_type=str(data.get("mistake_type", "concept_gap")),
                explanation=str(data.get("explanation", "")),
                personalized_explanation=str(data.get("personalized_explanation", "")),
                revision_task=str(data.get("revision_task", "")),
                confidence=float(data.get("confidence", 0.85)),
                provider="gemini",
            )
        except Exception:
            return None

    def _fallback_analysis(self, payload: AnswerAnalysisInput) -> AnswerAnalysisResult:
        student_answer = self._normalize(payload.student_answer)
        correct_answer = self._normalize(payload.correct_answer)
        similarity = self._similarity(student_answer, correct_answer)

        is_correct = bool(student_answer) and (
            student_answer == correct_answer or similarity >= 0.82
        )

        max_score = float(payload.marks or 1)

        if is_correct:
            score_awarded = max_score
        elif similarity >= 0.55:
            score_awarded = round(max_score * 0.5, 2)
        elif similarity >= 0.3:
            score_awarded = round(max_score * 0.25, 2)
        else:
            score_awarded = 0.0

        mistake_type = self._mistake_type(student_answer, correct_answer, similarity)
        weak_concept = (
            "No major weak concept detected"
            if is_correct
            else payload.topic or payload.subject or "Core concept"
        )

        explanation = (
            "Your answer matches the expected concept."
            if is_correct
            else f"The correct answer is: {payload.correct_answer}. Your answer was: {payload.student_answer or 'blank'}. Focus on {weak_concept}."
        )

        personalized_explanation = explanation

        if payload.interests and not is_correct:
            personalized_explanation = (
                f"{explanation} Think of it like {payload.interests[0]}: first understand the rule, then apply it."
            )

        revision_task = (
            f"Solve 3 higher-level questions from {weak_concept}."
            if is_correct
            else f"Revise {weak_concept}, write the correct answer once, then solve 3 similar questions."
        )

        return AnswerAnalysisResult(
            is_correct=is_correct,
            score_awarded=score_awarded,
            max_score=max_score,
            weak_concept=weak_concept,
            mistake_type=mistake_type,
            explanation=explanation,
            personalized_explanation=personalized_explanation,
            revision_task=revision_task,
            confidence=round(max(similarity, 0.65), 2),
            provider="local",
        )

    def _normalize(self, value: str | None) -> str:
        if not value:
            return ""

        value = value.lower().strip()
        value = re.sub(r"[^a-z0-9\s.+\-*/=]", "", value)
        value = re.sub(r"\s+", " ", value)

        return value

    def _similarity(self, first: str, second: str) -> float:
        if not first or not second:
            return 0.0

        return SequenceMatcher(None, first, second).ratio()

    def _mistake_type(
        self,
        student_answer: str,
        correct_answer: str,
        similarity: float,
    ) -> str:
        if not student_answer:
            return "unanswered"

        if student_answer == correct_answer:
            return "correct"

        number_pattern = r"-?\d+(\.\d+)?"
        student_numbers = re.findall(number_pattern, student_answer)
        correct_numbers = re.findall(number_pattern, correct_answer)

        if student_numbers and correct_numbers and student_numbers != correct_numbers:
            return "calculation_error"

        if similarity >= 0.55:
            return "partial_conceptual_understanding"

        if similarity >= 0.3:
            return "misconception"

        return "concept_gap"


local_learning_agent = LocalLearningAgent()
