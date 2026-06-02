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
    explanation_style = serializers.CharField(default="step_by_step")
