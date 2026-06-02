from __future__ import annotations

from rest_framework import serializers

from .models import StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="user.full_name",
        read_only=True,
    )
    student_email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "student_name",
            "student_email",
            "class_level",
            "primary_interest",
            "explanation_style",
            "learning_goal",
            "updated_at",
        ]
        read_only_fields = ["id", "student_name", "student_email", "updated_at"]
