from __future__ import annotations

from django.conf import settings
from django.db import models


class Attempt(models.Model):
    test = models.ForeignKey(
        "tests_app.Test",
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    total_marks = models.FloatField(default=0)
    obtained_marks = models.FloatField(default=0)
    percentage = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.student} - {self.test} - {self.percentage}%"


class AttemptAnswer(models.Model):
    attempt = models.ForeignKey(
        Attempt,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    question = models.ForeignKey(
        "tests_app.Question",
        on_delete=models.CASCADE,
        related_name="attempt_answers",
    )
    student_answer = models.TextField(blank=True)
    is_correct = models.BooleanField(default=False)
    marks_awarded = models.FloatField(default=0)

    def __str__(self) -> str:
        return f"Answer for question {self.question_id}"


class Mistake(models.Model):
    attempt = models.ForeignKey(
        Attempt,
        on_delete=models.CASCADE,
        related_name="mistakes",
    )
    attempt_answer = models.OneToOneField(
        AttemptAnswer,
        on_delete=models.CASCADE,
        related_name="mistake",
    )
    question = models.ForeignKey(
        "tests_app.Question",
        on_delete=models.CASCADE,
        related_name="mistakes",
    )
    weak_concept = models.CharField(max_length=255, blank=True)
    mistake_type = models.CharField(max_length=100, blank=True)
    explanation = models.TextField(blank=True)
    personalized_explanation = models.TextField(blank=True)
    revision_task = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.mistake_type} - {self.weak_concept}"
