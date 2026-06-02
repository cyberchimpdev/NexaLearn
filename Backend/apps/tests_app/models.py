from __future__ import annotations

from django.conf import settings
from django.db import models


class Test(models.Model):
    class Difficulty(models.TextChoices):
        EASY = "easy", "Easy"
        MEDIUM = "medium", "Medium"
        HARD = "hard", "Hard"

    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=100)
    topic = models.CharField(max_length=150)
    class_level = models.CharField(max_length=20, default="12")
    difficulty = models.CharField(
        max_length=20,
        choices=Difficulty.choices,
        default=Difficulty.MEDIUM,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_tests",
    )
    description = models.TextField(blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.title} - {self.subject}"


class Question(models.Model):
    test = models.ForeignKey(
        Test,
        on_delete=models.CASCADE,
        related_name="questions",
    )
    question_text = models.TextField()
    correct_answer = models.TextField()
    marks = models.PositiveIntegerField(default=1)
    difficulty = models.CharField(
        max_length=20,
        choices=Test.Difficulty.choices,
        default=Test.Difficulty.MEDIUM,
    )
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return f"Q{self.order}: {self.question_text[:50]}"
