from __future__ import annotations

from rest_framework import serializers


class AnalyzeAnswerSerializer(serializers.Serializer):
    question_text = serializers.CharField()
    correct_answer = serializers.CharField()
    student_answer = serializers.CharField(allow_blank=True)
    subject = serializers.CharField(required=False, default="General")
    topic = serializers.CharField(required=False, default="General")
    difficulty = serializers.CharField(required=False, default="medium")
    question_type = serializers.CharField(required=False, default="short_answer")
    marks = serializers.IntegerField(required=False, default=1, min_value=1)
    student_class = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    learning_style = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    interests = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class ChatSerializer(serializers.Serializer):
    message = serializers.CharField()
    subject = serializers.CharField(required=False, default="General")
    topic = serializers.CharField(required=False, default="General")
    student_class = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    learning_style = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    interests = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class GenerateQuizSerializer(serializers.Serializer):
    subject = serializers.CharField()
    topic = serializers.CharField()
    student_class = serializers.CharField(required=False, default="12")
    difficulty = serializers.CharField(required=False, default="Medium")
    total_questions = serializers.IntegerField(required=False, default=5, min_value=1, max_value=20)
    marks_per_question = serializers.IntegerField(required=False, default=2, min_value=1, max_value=10)
    interests = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class EvaluatePracticeSerializer(serializers.Serializer):
    questions = serializers.ListField(child=serializers.DictField(), required=True)
    answers = serializers.JSONField(required=True)
    subject = serializers.CharField(required=False, default="General")
    topic = serializers.CharField(required=False, default="General")
    student_class = serializers.CharField(required=False, default="12")
    interests = serializers.ListField(child=serializers.CharField(), required=False, default=list)
