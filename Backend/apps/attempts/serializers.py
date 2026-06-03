# apps/attempts/serializers.py

from __future__ import annotations

from rest_framework import serializers

from .models import Attempt, AttemptAnswer, Mistake


class AttemptAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source="question.text", read_only=True)
    correct_answer = serializers.CharField(source="question.correct_answer", read_only=True)

    class Meta:
        model = AttemptAnswer
        fields = [
            "id",
            "question",
            "question_text",
            "student_answer",
            "correct_answer",
            "is_correct",
            "marks_awarded",
        ]


class MistakeSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source="question.text", read_only=True)
    student_answer = serializers.CharField(source="attempt_answer.student_answer", read_only=True)
    correct_answer = serializers.CharField(source="question.correct_answer", read_only=True)

    class Meta:
        model = Mistake
        fields = [
            "id",
            "question",
            "question_text",
            "student_answer",
            "correct_answer",
            "weak_concept",
            "mistake_type",
            "explanation",
            "personalized_explanation",
            "revision_task",
            "created_at",
        ]


class AttemptListSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source="test.title", read_only=True)

    class Meta:
        model = Attempt
        fields = [
            "id",
            "test",
            "test_title",
            "total_marks",
            "obtained_marks",
            "percentage",
            "created_at",
        ]


class AttemptDetailSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source="test.title", read_only=True)
    answers = AttemptAnswerSerializer(many=True, read_only=True)
    mistakes = MistakeSerializer(many=True, read_only=True)

    class Meta:
        model = Attempt
        fields = [
            "id",
            "test",
            "test_title",
            "total_marks",
            "obtained_marks",
            "percentage",
            "answers",
            "mistakes",
            "created_at",
        ]
