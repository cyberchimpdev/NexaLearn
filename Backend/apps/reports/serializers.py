from __future__ import annotations

from rest_framework import serializers

from .models import ClassReportSnapshot, RemedialGroup


class ClassReportSnapshotSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source="test.title", read_only=True)
    subject = serializers.CharField(source="test.subject", read_only=True)
    topic = serializers.CharField(source="test.topic", read_only=True)
    class_level = serializers.CharField(source="test.class_level", read_only=True)

    class Meta:
        model = ClassReportSnapshot
        fields = [
            "id",
            "test",
            "test_title",
            "subject",
            "topic",
            "class_level",
            "total_attempts",
            "average_score",
            "average_percentage",
            "most_common_weak_concept",
            "most_common_mistake_type",
            "suggested_teacher_action",
            "generated_at",
        ]


class RemedialGroupSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source="test.title", read_only=True)

    class Meta:
        model = RemedialGroup
        fields = [
            "id",
            "test",
            "test_title",
            "group_name",
            "mistake_type",
            "weak_concept",
            "suggested_action",
            "student_count",
            "generated_at",
        ]
