from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone


class StudentProfile(models.Model):
    class LearningStyle(models.TextChoices):
        SIMPLE = "simple", "Simple"
        VISUAL = "visual", "Visual"
        STORY = "story", "Story Based"
        EXAMPLE = "example", "Example Based"
        PRACTICE = "practice", "Practice Based"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    grade_level = models.CharField(max_length=50, default="General")
    learning_style = models.CharField(
        max_length=30,
        choices=LearningStyle.choices,
        default=LearningStyle.SIMPLE,
    )
    interests = models.JSONField(default=list, blank=True)
    preferred_subjects = models.JSONField(default=list, blank=True)
    weak_subjects = models.JSONField(default=list, blank=True)

    daily_goal_minutes = models.PositiveIntegerField(default=30)
    preferred_explanation_length = models.CharField(
        max_length=20,
        default="medium",
        help_text="short, medium, or detailed",
    )

    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Student Profile"
        verbose_name_plural = "Student Profiles"

    def __str__(self) -> str:
        return f"{self.user} - {self.grade_level}"

    def update_streak(self) -> None:
        today = timezone.localdate()

        if self.last_active_date == today:
            return

        if self.last_active_date == today - timezone.timedelta(days=1):
            self.current_streak += 1
        else:
            self.current_streak = 1

        self.longest_streak = max(self.longest_streak, self.current_streak)
        self.last_active_date = today

        self.save(
            update_fields=[
                "current_streak",
                "longest_streak",
                "last_active_date",
                "updated_at",
            ]
        )


class StudentStreak(models.Model):
    profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="streak_logs",
    )
    date = models.DateField(default=timezone.localdate)
    activity_type = models.CharField(max_length=100, default="learning_activity")
    points = models.PositiveIntegerField(default=10)
    note = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Student Streak"
        verbose_name_plural = "Student Streaks"
        unique_together = ("profile", "date", "activity_type")
        ordering = ["-date", "-created_at"]

    def __str__(self) -> str:
        return f"{self.profile.user} - {self.date} - {self.activity_type}"
