from __future__ import annotations

from django.conf import settings
from django.db import models


class StudentProfile(models.Model):
    class Interest(models.TextChoices):
        ANIME = "anime", "Anime"
        CRICKET = "cricket", "Cricket"
        GAMING = "gaming", "Gaming"
        MOVIES = "movies", "Movies"
        REAL_LIFE = "real_life", "Real Life"
        TEXTBOOK = "textbook", "Textbook Style"

    class ExplanationStyle(models.TextChoices):
        SIMPLE = "simple", "Simple"
        STORY_BASED = "story_based", "Story Based"
        EXAM_FOCUSED = "exam_focused", "Exam Focused"
        VISUAL = "visual", "Visual"
        STEP_BY_STEP = "step_by_step", "Step By Step"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    class_level = models.CharField(max_length=20, default="12")
    primary_interest = models.CharField(
        max_length=30,
        choices=Interest.choices,
        default=Interest.REAL_LIFE,
    )
    explanation_style = models.CharField(
        max_length=30,
        choices=ExplanationStyle.choices,
        default=ExplanationStyle.STEP_BY_STEP,
    )
    learning_goal = models.CharField(
        max_length=255,
        blank=True,
        default="Improve weak concepts through personalized revision.",
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.user.email} - Class {self.class_level}"
