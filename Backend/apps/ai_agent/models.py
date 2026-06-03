from __future__ import annotations

from django.conf import settings
from django.db import models


class StudentMistake(models.Model):
    MISTAKE_TYPES = (
        ("conceptual", "Conceptual Mistake"),
        ("careless", "Careless Mistake"),
        ("misread", "Misread Question"),
        ("incomplete", "Incomplete Answer"),
        ("application", "Application Error"),
    )

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_mistakes",
    )
    subject = models.CharField(max_length=120)
    topic = models.CharField(max_length=160)
    question = models.TextField()
    student_answer = models.TextField()
    correct_answer = models.TextField(blank=True)
    mistake_type = models.CharField(max_length=40, choices=MISTAKE_TYPES)
    weak_concept = models.CharField(max_length=180)
    explanation = models.TextField()
    revision_task = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class GeneratedQuiz(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="generated_quizzes",
    )
    subject = models.CharField(max_length=120)
    topic = models.CharField(max_length=160)
    difficulty = models.CharField(max_length=50, default="medium")
    quiz_json = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class DailyLearningStreak(models.Model):
    student = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="learning_streak",
    )
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    total_learning_days = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return f"{self.student} - {self.current_streak} days"
