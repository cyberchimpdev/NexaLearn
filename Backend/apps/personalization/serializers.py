from __future__ import annotations

from rest_framework import serializers

from .models import StudentProfile, StudentStreak


class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "username",
            "email",
            "grade_level",
            "learning_style",
            "interests",
            "preferred_subjects",
            "weak_subjects",
            "daily_goal_minutes",
            "preferred_explanation_length",
            "current_streak",
            "longest_streak",
            "last_active_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "username",
            "email",
            "current_streak",
            "longest_streak",
            "last_active_date",
            "created_at",
            "updated_at",
        ]

    def validate_interests(self, value: list[str]) -> list[str]:
        if not isinstance(value, list):
            raise serializers.ValidationError("Interests must be a list.")

        return [str(item).strip() for item in value if str(item).strip()]

    def validate_preferred_subjects(self, value: list[str]) -> list[str]:
        if not isinstance(value, list):
            raise serializers.ValidationError("Preferred subjects must be a list.")

        return [str(item).strip() for item in value if str(item).strip()]

    def validate_weak_subjects(self, value: list[str]) -> list[str]:
        if not isinstance(value, list):
            raise serializers.ValidationError("Weak subjects must be a list.")

        return [str(item).strip() for item in value if str(item).strip()]


class StudentStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentStreak
        fields = [
            "id",
            "profile",
            "date",
            "activity_type",
            "points",
            "note",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "profile",
            "date",
            "created_at",
        ]


class StudentStreakCreateSerializer(serializers.Serializer):
    activity_type = serializers.CharField(
        max_length=100,
        required=False,
        default="learning_activity",
    )
    points = serializers.IntegerField(
        min_value=1,
        max_value=100,
        required=False,
        default=10,
    )
    note = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
