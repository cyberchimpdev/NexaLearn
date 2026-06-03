from rest_framework import serializers

from .models import AnswerAttempt, Attempt


class SubmittedAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    student_answer = serializers.CharField(allow_blank=True)


class SubmitAttemptSerializer(serializers.Serializer):
    test_id = serializers.IntegerField()
    answers = SubmittedAnswerSerializer(many=True)


class AnswerAttemptSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source="question.question_text", read_only=True)
    correct_answer = serializers.CharField(source="question.correct_answer", read_only=True)
    marks = serializers.IntegerField(source="question.marks", read_only=True)
    order = serializers.IntegerField(source="question.order", read_only=True)

    class Meta:
        model = AnswerAttempt
        fields = [
            "id",
            "question",
            "question_text",
            "correct_answer",
            "marks",
            "order",
            "student_answer",
            "is_correct",
            "score",
            "mistake_type",
            "weak_concept",
            "ai_reason",
            "correct_solution",
            "interest_based_explanation",
            "revision_task",
        ]


class AttemptDetailSerializer(serializers.ModelSerializer):
    answers = AnswerAttemptSerializer(many=True, read_only=True)
    test_title = serializers.CharField(source="test.title", read_only=True)
    subject = serializers.CharField(source="test.subject", read_only=True)
    topic = serializers.CharField(source="test.topic", read_only=True)
    class_level = serializers.CharField(source="test.class_level", read_only=True)
    percentage = serializers.SerializerMethodField()

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

    def get_percentage(self, obj):
        if not obj.total_marks:
            return 0
        return round((float(obj.total_score) / float(obj.total_marks)) * 100, 2)
