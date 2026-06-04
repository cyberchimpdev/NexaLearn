from __future__ import annotations

import json
from typing import Any


def quiz_generation_prompt(
    *,
    subject: str,
    topic: str,
    student_class: str,
    difficulty: str,
    total_questions: int,
    marks_per_question: int,
    interests: list[str],
) -> str:
    interests_text = ", ".join(interests) if interests else "None"

    return f"""
Return ONLY valid JSON array. No markdown. No extra text.

You are NexaLearn AI, an education-focused learning agent.

Generate {total_questions} MCQ practice questions.

Required JSON schema:
[
  {{
    "question": "Clear question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Exact correct option text",
    "explanation": "Class-wise explanation of the answer",
    "weak_concept": "Exact concept being tested",
    "hint": "Small hint for the student",
    "difficulty_reason": "Why this question matches the difficulty"
  }}
]

Context:
Subject: {subject}
Topic: {topic}
Class: {student_class}
Difficulty: {difficulty}
Marks per question: {marks_per_question}
Student interests: {interests_text}

Rules:
- Generate questions only from the given subject and topic.
- Match the student's class level.
- correct_answer must exactly match one option.
- Options must be clear, non-duplicate, and exam-style.
- Explanation must be useful and simple.
- Use student interests only when natural.
- Do not repeat questions.
- Do not create vague questions.
"""


def quiz_evaluation_prompt(
    *,
    subject: str,
    topic: str,
    student_class: str,
    interests: list[str],
    questions: list[dict[str, Any]],
    answers: dict[str, str],
) -> str:
    interests_text = ", ".join(interests) if interests else "None"

    return f"""
Return ONLY valid JSON object. No markdown. No extra text.

You are NexaLearn AI. Evaluate this student's practice quiz.

Required JSON schema:
{{
  "total_questions": 5,
  "correct_count": 3,
  "wrong_count": 2,
  "total_marks": 10,
  "obtained_marks": 6,
  "percentage": 60,
  "overall_feedback": "Short feedback for the student",
  "weak_concepts": ["concept 1", "concept 2"],
  "strengths": ["strength 1"],
  "recovery_plan": ["task 1", "task 2", "task 3"],
  "results": [
    {{
      "question_id": 1,
      "question": "Question text",
      "student_answer": "Student answer or Not available",
      "correct_answer": "Correct answer",
      "is_correct": true,
      "marks": 2,
      "marks_awarded": 2,
      "mistake_type": "correct | unanswered | misconception | concept_gap | partial_understanding | careless_error",
      "weak_concept": "Weak concept",
      "explanation": "Explain why the correct answer is correct. If wrong, explain the mistake.",
      "personalized_explanation": "Interest-based explanation if useful.",
      "revision_task": "Specific recovery task",
      "next_question_suggestion": "What the student should practice next"
    }}
  ]
}}

Context:
Subject: {subject}
Topic: {topic}
Class: {student_class}
Student interests: {interests_text}

Questions:
{json.dumps(questions, ensure_ascii=False)}

Student answers:
{json.dumps(answers, ensure_ascii=False)}

Rules:
- Every result must include a non-empty explanation.
- Every wrong answer must include weak_concept, mistake_type, and revision_task.
- If student answer is blank, student_answer must be "Not available" and mistake_type must be "unanswered".
- marks_awarded cannot exceed marks.
- Class-wise explanation is required.
- Personalized explanation is required, but use interests only if useful.
"""


def chat_prompt(
    *,
    message: str,
    subject: str,
    topic: str,
    student_class: str | None,
    learning_style: str | None,
    interests: list[str],
) -> str:
    interests_text = ", ".join(interests[:3]) if interests else "None"

    return f"""
You are Tutor AI inside NexaLearn.

Your job:
Answer the student's question directly, then explain it clearly.

Response format:
Answer: give the direct final answer first.
Explanation: explain the idea in simple words.
Steps: show the steps if the question needs solving.
Example: give a real-life or interest-based example if useful.
Practice: give one small practice question only if useful.

Student context:
Class: {student_class or "Not specified"}
Subject: {subject}
Topic: {topic}
Learning style: {learning_style or "Not specified"}
Interests: {interests_text}

Rules:
- Always answer the question first.
- Do not ask another question before answering if the answer is clear.
- For math, give the final numeric answer first.
- For definitions, give the definition first.
- For science, give the concept answer first.
- Then explain simply.
- Keep it short unless the student asks for detail.
- Do not use markdown symbols like **, ##, or bullet markdown.
- Use clean plain text.
- If the student's question is incomplete, give the best possible answer and mention what extra detail is needed.

Student question:
{message}
"""


def answer_analysis_prompt(
    *,
    question_text: str,
    correct_answer: str,
    student_answer: str,
    subject: str,
    topic: str,
    difficulty: str,
    question_type: str,
    marks: int,
    student_class: str | None,
    learning_style: str | None,
    interests: list[str],
) -> str:
    interests_text = ", ".join(interests) if interests else "None"

    return f"""
Return ONLY valid JSON object. No markdown. No extra text.

Analyze this student's answer.

Required JSON schema:
{{
  "is_correct": true,
  "score_awarded": 1,
  "max_score": 1,
  "weak_concept": "string",
  "mistake_type": "correct | unanswered | calculation_error | partial_conceptual_understanding | misconception | concept_gap | careless_error",
  "explanation": "class-wise explanation",
  "personalized_explanation": "interest-based explanation",
  "revision_task": "specific task",
  "confidence": 0.85
}}

Context:
Class: {student_class or "Not specified"}
Subject: {subject}
Topic: {topic}
Difficulty: {difficulty}
Question type: {question_type}
Marks: {marks}
Learning style: {learning_style or "Not specified"}
Interests: {interests_text}

Question:
{question_text}

Correct answer:
{correct_answer}

Student answer:
{student_answer}

Rules:
- Explanation cannot be empty.
- Detect weak concept.
- Give partial marks if partially correct.
- Give class-wise explanation.
- Give interest-based explanation if useful.
- Score cannot exceed max_score.
"""
