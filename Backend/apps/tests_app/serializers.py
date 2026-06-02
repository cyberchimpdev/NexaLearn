from __future__ import annotations

from rest_framework import serializers

from .models import Question, Test


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            "id",
            "question_text",
            "correct_answer",
            "marks",
            "difficulty",
            "order",
        ]
        read_only_fields = ["id"]


class TestListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source="created_by.full_name",
        read_only=True,
    )
    question_count = serializers.SerializerMethodField()
    total_marks = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = [
            "id",
            "title",
            "subject",
            "topic",
            "class_level",
            "difficulty",
            "description",
            "is_published",
            "created_by_name",
            "question_count",
            "total_marks",
            "created_at",
        ]

    def get_question_count(self, obj: Test) -> int:
        return obj.questions.count()

    def get_total_marks(self, obj: Test) -> int:
        return sum(question.marks for question in obj.questions.all())


class TestDetailSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source="created_by.full_name",
        read_only=True,
    )
    questions = QuestionSerializer(many=True)
    question_count = serializers.SerializerMethodField()
    total_marks = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = [
            "id",
            "title",
            "subject",
            "topic",
            "class_level",
            "difficulty",
            "description",
            "is_published",
            "created_by_name",
            "question_count",
            "total_marks",
            "questions",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_by_name",
            "question_count",
            "total_marks",
            "created_at",
        ]

    def get_question_count(self, obj: Test) -> int:
        return obj.questions.count()

    def get_total_marks(self, obj: Test) -> int:
        return sum(question.marks for question in obj.questions.all())

    def validate_questions(self, value: list[dict]) -> list[dict]:
        if not value:
            raise serializers.ValidationError("At least one question is required.")

        for question in value:
            marks = question.get("marks", 0)
            if marks <= 0:
                raise serializers.ValidationError(
                    "Question marks must be greater than 0."
                )

        return value

    def create(self, validated_data: dict) -> Test:
        questions_data = validated_data.pop("questions", [])
        request = self.context["request"]

        test = Test.objects.create(
            created_by=request.user,
            **validated_data,
        )

        for index, question_data in enumerate(questions_data, start=1):
            question_order = question_data.pop("order", index)

            Question.objects.create(
                test=test,
                order=question_order,
                **question_data,
            )

        return test

    def update(self, instance: Test, validated_data: dict) -> Test:
        questions_data = validated_data.pop("questions", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if questions_data is not None:
            instance.questions.all().delete()

            for index, question_data in enumerate(questions_data, start=1):
                question_order = question_data.pop("order", index)

                Question.objects.create(
                    test=instance,
                    order=question_order,
                    **question_data,
                )

        return instance
