from __future__ import annotations

from rest_framework import serializers


class AnalyzeAnswerSerializer(serializers.Serializer):
    class_level = serializers.CharField()
    subject = serializers.CharField()
    topic = serializers.CharField()
    question = serializers.CharField()
    correct_answer = serializers.CharField()
    student_answer = serializers.CharField(allow_blank=True)
    marks = serializers.IntegerField(min_value=1)
    student_interest = serializers.CharField(default="real_life")
    explanation_style = serializers.CharField(default="step_by_step")


class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField()
    class_level = serializers.CharField(default="12")
    subject = serializers.CharField(default="General")
    topic = serializers.CharField(default="")
    student_interest = serializers.CharField(default="real_life")
    explanation_style = serializers.CharField(default="simple")


class GenerateQuizSerializer(serializers.Serializer):
    subject = serializers.CharField()
    topic = serializers.CharField()
    class_level = serializers.CharField()
    difficulty = serializers.ChoiceField(
        choices=["easy", "medium", "hard"],
        default="medium",
    )
    question_count = serializers.IntegerField(min_value=1, max_value=20, default=5)
    marks_per_question = serializers.IntegerField(min_value=1, max_value=10, default=2)
    publish = serializers.BooleanField(default=False)
