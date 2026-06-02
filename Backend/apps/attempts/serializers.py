from __future__ import annotations

from rest_framework import serializers

from apps.tests_app.models import Test

from .models import AnswerAttempt, Attempt


class SubmittedAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    student_answer = serializers.CharField(allow_blank=True)


class SubmitAttemptSerializer(serializers.Serializer):
    test_id = serializers.IntegerField()
    answers = SubmittedAnswerSerializer(many=True)

    def validate_test_id(self, value: int) -> int:
        if not Test.objects.filter(id=value, is_published=True).exists():
            raise serializers.ValidationError("Test not found or not published.")
        return value

    def validate_answers(self, value: list[dict]) -> list[dict]:
        if not value:
            raise serializers.ValidationError("At least one answer is required.")
        return value


class AnswerAttemptSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(
        source="question.question_text",
        read_only=True,
    )
    correct_answer = serializers.CharField(
        source="question.correct_answer",
        read_only=True,
    )
    marks = serializers.IntegerField(
        source="question.marks",
        read_only=True,
    )
    order = serializers.IntegerField(
        source="question.order",
        read_only=True,
    )

    class Meta:
        model = AnswerAttempt
        fields = [
            "id",
            "question_text",
            "correct_answer",
            "student_answer",
            "marks",
            "order",
            "is_correct",
            "score",
            "mistake_type",
            "weak_concept",
            "ai_reason",
            "correct_solution",
            "interest_based_explanation",
            "revision_task",
            "created_at",
        ]


class AttemptDetailSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source="test.title", read_only=True)
    subject = serializers.CharField(source="test.subject", read_only=True)
    topic = serializers.CharField(source="test.topic", read_only=True)
    class_level = serializers.CharField(source="test.class_level", read_only=True)
    answers = AnswerAttemptSerializer(many=True, read_only=True)

    class Meta:
        model = Attempt
        fields = [
            "id",
            "test",
            "test_title",
            "subject",
            "topic",
            "class_level",
            "total_score",
            "total_marks",
            "percentage",
            "submitted_at",
            "answers",
        ]


class AttemptListSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source="test.title", read_only=True)
    subject = serializers.CharField(source="test.subject", read_only=True)
    topic = serializers.CharField(source="test.topic", read_only=True)

    class Meta:
        model = Attempt
        fields = [
            "id",
            "test",
            "test_title",
            "subject",
            "topic",
            "total_score",
            "total_marks",
            "percentage",
            "submitted_at",
        ]
