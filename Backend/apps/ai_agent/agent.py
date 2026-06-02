from __future__ import annotations

import re
from difflib import SequenceMatcher

from .knowledge_base import (
    CLASS_LEVEL_TEMPLATES,
    INTEREST_EXPLANATION_TEMPLATES,
    NEXALEARN_KNOWLEDGE_BASE,
)
from .schemas import AnswerAnalysisInput, AnswerAnalysisOutput


class NexaLearnAgent:
    UNIT_PATTERNS = [
        "n/c",
        "v/m",
        "m/s",
        "m/s^2",
        "kg",
        "n",
        "j",
        "w",
        "pa",
        "c",
        "mol",
    ]

    def analyze_answer(self, payload: AnswerAnalysisInput) -> AnswerAnalysisOutput:
        student_answer = payload.student_answer.strip()
        correct_answer = payload.correct_answer.strip()

        normalized_student = self._normalize(student_answer)
        normalized_correct = self._normalize(correct_answer)

        topic_data = self._get_topic_data(payload.subject, payload.topic)

        similarity = self._similarity(normalized_student, normalized_correct)
        same_number = self._same_number(normalized_student, normalized_correct)
        valid_unit = self._unit_is_valid(normalized_student, normalized_correct, topic_data)

        is_correct = (
            normalized_student == normalized_correct
            or similarity >= 0.86
            or (same_number and valid_unit)
        )

        if is_correct:
            score = float(payload.marks)
            mistake_type = "No mistake"
            reason = "The answer matches the expected answer or core concept."
        else:
            mistake_type = self._detect_mistake_type(
                payload=payload,
                similarity=similarity,
                same_number=same_number,
                valid_unit=valid_unit,
                topic_data=topic_data,
            )
            score = self._calculate_score(payload.marks, similarity, mistake_type)
            reason = self._build_reason(payload, mistake_type, topic_data)

        weak_concept = self._detect_weak_concept(payload, mistake_type, topic_data)

        return AnswerAnalysisOutput(
            is_correct=is_correct,
            score=score,
            mistake_type=mistake_type,
            weak_concept=weak_concept,
            reason=reason,
            correct_solution=self._build_correct_solution(payload, topic_data),
            interest_based_explanation=self._build_interest_explanation(payload, topic_data),
            revision_task=self._build_revision_task(payload, mistake_type, topic_data),
        )

    def _get_topic_data(self, subject: str, topic: str) -> dict[str, object]:
        subject_key = subject.lower().strip()
        topic_key = topic.lower().strip()

        subject_data = NEXALEARN_KNOWLEDGE_BASE.get(subject_key, {})

        if topic_key in subject_data:
            return subject_data[topic_key]

        for existing_topic, data in subject_data.items():
            if topic_key in existing_topic or existing_topic in topic_key:
                return data

        return {
            "core_concept": f"{topic} is the key concept being tested.",
            "formula": "",
            "unit": "",
            "common_mistakes": [
                "Conceptual misunderstanding.",
                "Incomplete answer.",
                "Careless mistake.",
            ],
            "solution_pattern": (
                "Read the question carefully, identify the concept, write the correct rule, "
                "and answer step by step."
            ),
            "practice_tasks": [
                f"Revise the basic concept of {topic}.",
                f"Solve 3 practice questions from {topic}.",
            ],
        }

    def _normalize(self, text: str) -> str:
        normalized = text.lower().strip()
        normalized = normalized.replace("×", "x")
        normalized = normalized.replace("*", "x")
        normalized = normalized.replace("÷", "/")
        normalized = re.sub(r"\s+", " ", normalized)
        normalized = re.sub(r"[^a-z0-9/=\.\-\s]", "", normalized)
        return normalized.strip()

    def _similarity(self, first: str, second: str) -> float:
        if not first or not second:
            return 0.0
        return SequenceMatcher(None, first, second).ratio()

    def _extract_numbers(self, text: str) -> list[str]:
        return re.findall(r"-?\d+(?:\.\d+)?", text)

    def _same_number(self, first: str, second: str) -> bool:
        first_numbers = self._extract_numbers(first)
        second_numbers = self._extract_numbers(second)

        if not first_numbers or not second_numbers:
            return False

        try:
            return float(first_numbers[0]) == float(second_numbers[0])
        except ValueError:
            return first_numbers[0] == second_numbers[0]

    def _unit_is_valid(
        self,
        answer: str,
        correct: str,
        topic_data: dict[str, object],
    ) -> bool:
        expected_unit = str(topic_data.get("unit", "")).lower().strip()

        if expected_unit:
            return expected_unit in answer

        correct_units = [unit for unit in self.UNIT_PATTERNS if unit in correct]
        if not correct_units:
            return True

        return any(unit in answer for unit in correct_units)

    def _calculate_score(
        self,
        marks: int,
        similarity: float,
        mistake_type: str,
    ) -> float:
        if mistake_type == "No mistake":
            return float(marks)

        if mistake_type in ["Formula mistake", "Conceptual mistake"]:
            return 0.0

        if mistake_type == "Unit mistake":
            return round(marks * 0.75, 2)

        if mistake_type == "Incomplete answer":
            return 0.0

        if similarity >= 0.65:
            return round(marks * 0.5, 2)

        if similarity >= 0.45:
            return round(marks * 0.25, 2)

        return 0.0

    def _detect_mistake_type(
        self,
        payload: AnswerAnalysisInput,
        similarity: float,
        same_number: bool,
        valid_unit: bool,
        topic_data: dict[str, object],
    ) -> str:
        answer = self._normalize(payload.student_answer)
        correct = self._normalize(payload.correct_answer)
        question = self._normalize(payload.question)

        if not answer:
            return "Incomplete answer"

        if same_number and not valid_unit:
            return "Unit mistake"

        if self._has_number(answer) and self._has_number(correct):
            if not same_number:
                if self._is_formula_question(question, payload.topic, topic_data):
                    return "Formula mistake"
                return "Calculation mistake"

        if any(word in answer for word in ["x", "multiply", "product"]) and "/" in correct:
            return "Formula mistake"

        if similarity >= 0.45:
            return "Careless mistake"

        if any(word in question for word in ["state", "define", "explain", "why", "what"]):
            return "Conceptual mistake"

        return "Conceptual mistake"

    def _has_number(self, text: str) -> bool:
        return bool(re.search(r"-?\d+(?:\.\d+)?", text))

    def _is_formula_question(
        self,
        question: str,
        topic: str,
        topic_data: dict[str, object],
    ) -> bool:
        formula = str(topic_data.get("formula", "")).strip()

        formula_keywords = [
            "find",
            "calculate",
            "formula",
            "force",
            "charge",
            "field",
            "speed",
            "pressure",
            "energy",
            "current",
            "voltage",
            "resistance",
            "mole",
            "mass",
            "area",
        ]

        topic_words = topic.lower().split()

        return bool(formula) or any(word in question for word in formula_keywords + topic_words)

    def _detect_weak_concept(
        self,
        payload: AnswerAnalysisInput,
        mistake_type: str,
        topic_data: dict[str, object],
    ) -> str:
        topic = payload.topic

        if mistake_type == "No mistake":
            return f"{topic} understanding"

        if mistake_type == "Formula mistake":
            formula = topic_data.get("formula", "")
            if formula:
                return f"{topic} formula application: {formula}"
            return f"{topic} formula application"

        if mistake_type == "Calculation mistake":
            return f"{topic} numerical calculation"

        if mistake_type == "Unit mistake":
            expected_unit = topic_data.get("unit", "")
            if expected_unit:
                return f"{topic} unit usage: {expected_unit}"
            return f"{topic} unit usage"

        if mistake_type == "Incomplete answer":
            return f"{topic} complete answer writing"

        return f"{topic} core concept"

    def _build_reason(
        self,
        payload: AnswerAnalysisInput,
        mistake_type: str,
        topic_data: dict[str, object],
    ) -> str:
        common_mistakes = topic_data.get("common_mistakes", [])
        mistake_hint = ""

        if isinstance(common_mistakes, list) and common_mistakes:
            mistake_hint = f" Common issue: {common_mistakes[0]}"

        if mistake_type == "Formula mistake":
            return (
                f"The answer suggests the formula for {payload.topic} was applied incorrectly."
                f"{mistake_hint}"
            )

        if mistake_type == "Calculation mistake":
            return (
                "The concept may be partially understood, but the final numerical value "
                f"does not match the expected answer.{mistake_hint}"
            )

        if mistake_type == "Unit mistake":
            return (
                "The numerical value is close or correct, but the required unit is missing "
                f"or incorrect.{mistake_hint}"
            )

        if mistake_type == "Incomplete answer":
            return "The answer is incomplete, so the AI cannot fully verify the concept."

        if mistake_type == "Careless mistake":
            return "The answer is close to the expected answer but not accurate enough."

        return f"The answer shows confusion in the core concept of {payload.topic}.{mistake_hint}"

    def _build_correct_solution(
        self,
        payload: AnswerAnalysisInput,
        topic_data: dict[str, object],
    ) -> str:
        concept = topic_data.get("core_concept", "")
        formula = topic_data.get("formula", "")
        solution_pattern = topic_data.get("solution_pattern", "")

        parts = [
            f"Question: {payload.question}",
            f"Correct answer: {payload.correct_answer}",
        ]

        if concept:
            parts.append(f"Concept: {concept}")

        if formula:
            parts.append(f"Formula: {formula}")

        if solution_pattern:
            parts.append(f"Solution pattern: {solution_pattern}")

        return "\n".join(parts)

    def _build_interest_explanation(
        self,
        payload: AnswerAnalysisInput,
        topic_data: dict[str, object],
    ) -> str:
        topic = payload.topic
        interest = payload.student_interest
        class_level = payload.class_level

        class_instruction = CLASS_LEVEL_TEMPLATES.get(
            class_level,
            CLASS_LEVEL_TEMPLATES.get(class_level.upper(), "Use clear step-by-step explanation."),
        )

        template = INTEREST_EXPLANATION_TEMPLATES.get(
            interest,
            INTEREST_EXPLANATION_TEMPLATES["real_life"],
        )

        concept = topic_data.get("core_concept", "")
        formula = topic_data.get("formula", "")

        explanation = template.format(topic=topic)

        if concept:
            explanation += f"\n\nAcademic concept: {concept}"

        if formula:
            explanation += f"\nFormula to remember: {formula}"

        explanation += f"\nClass-wise style: {class_instruction}"

        return explanation

    def _build_revision_task(
        self,
        payload: AnswerAnalysisInput,
        mistake_type: str,
        topic_data: dict[str, object],
    ) -> str:
        tasks = topic_data.get("practice_tasks", [])

        if isinstance(tasks, list) and tasks:
            base_task = tasks[0]
        else:
            base_task = f"Solve 3 practice questions from {payload.topic}."

        if mistake_type == "No mistake":
            return f"Good work. Now solve 2 higher-level questions from {payload.topic}."

        if mistake_type == "Formula mistake":
            return f"{base_task} Focus on formula selection and substitution."

        if mistake_type == "Calculation mistake":
            return f"{base_task} Write every calculation step and final unit."

        if mistake_type == "Unit mistake":
            return f"{base_task} Pay special attention to units."

        if mistake_type == "Incomplete answer":
            return (
                f"Write one complete answer from {payload.topic}: definition, formula/concept, "
                "example, and final conclusion."
            )

        return f"{base_task} Then explain the concept once in your own words."
