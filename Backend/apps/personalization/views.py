from __future__ import annotations

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import StudentProfile, StudentStreak
from .serializers import (
    StudentProfileSerializer,
    StudentStreakCreateSerializer,
    StudentStreakSerializer,
)


class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self) -> StudentProfile:
        profile, _ = StudentProfile.objects.get_or_create(
            user=self.request.user,
            defaults={
                "grade_level": "General",
                "learning_style": StudentProfile.LearningStyle.SIMPLE,
                "interests": [],
                "preferred_subjects": [],
                "weak_subjects": [],
            },
        )
        return profile


class StudentProfileCreateView(generics.CreateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        profile, created = StudentProfile.objects.get_or_create(
            user=request.user,
            defaults={
                "grade_level": request.data.get("grade_level", "General"),
                "learning_style": request.data.get("learning_style", "simple"),
                "interests": request.data.get("interests", []),
                "preferred_subjects": request.data.get("preferred_subjects", []),
                "weak_subjects": request.data.get("weak_subjects", []),
                "daily_goal_minutes": request.data.get("daily_goal_minutes", 30),
                "preferred_explanation_length": request.data.get(
                    "preferred_explanation_length",
                    "medium",
                ),
            },
        )

        if not created:
            serializer = self.get_serializer(
                profile,
                data=request.data,
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = self.get_serializer(profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StudentStreakView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)

        streak_logs = (
            StudentStreak.objects.select_related("profile", "profile__user")
            .filter(profile=profile)
            .order_by("-date", "-created_at")[:30]
        )

        return Response(
            {
                "current_streak": profile.current_streak,
                "longest_streak": profile.longest_streak,
                "last_active_date": profile.last_active_date,
                "logs": StudentStreakSerializer(streak_logs, many=True).data,
            },
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def post(self, request):
        profile, _ = StudentProfile.objects.select_for_update().get_or_create(
            user=request.user
        )

        serializer = StudentStreakCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        activity_type = serializer.validated_data.get(
            "activity_type",
            "learning_activity",
        )
        points = serializer.validated_data.get("points", 10)
        note = serializer.validated_data.get("note", "")

        today = timezone.localdate()

        try:
            streak_log, created = StudentStreak.objects.get_or_create(
                profile=profile,
                date=today,
                activity_type=activity_type,
                defaults={
                    "points": points,
                    "note": note,
                },
            )
        except IntegrityError:
            streak_log = StudentStreak.objects.get(
                profile=profile,
                date=today,
                activity_type=activity_type,
            )
            created = False

        profile.update_streak()

        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK

        return Response(
            {
                "created": created,
                "current_streak": profile.current_streak,
                "longest_streak": profile.longest_streak,
                "last_active_date": profile.last_active_date,
                "log": StudentStreakSerializer(streak_log).data,
            },
            status=response_status,
        )


class LearningProfileSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)

        return Response(
            {
                "grade_level": profile.grade_level,
                "learning_style": profile.learning_style,
                "interests": profile.interests,
                "preferred_subjects": profile.preferred_subjects,
                "weak_subjects": profile.weak_subjects,
                "daily_goal_minutes": profile.daily_goal_minutes,
                "preferred_explanation_length": profile.preferred_explanation_length,
                "current_streak": profile.current_streak,
                "longest_streak": profile.longest_streak,
            },
            status=status.HTTP_200_OK,
        )
