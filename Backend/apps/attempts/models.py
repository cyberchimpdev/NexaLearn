from __future__ import annotations

from django.conf import settings
from django.db import models

from apps.tests_app.models import Question, Test


class Attempt(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    test = models.ForeignKey(
        Test,
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    total_score = models.FloatField(default=0)
    total_marks = models.FloatField(default=0)
    percentage = models.FloatField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self) -> str:
        return f"{self.student.email} - {self.test.title}"


class AnswerAttempt(models.Model):
    attempt = models.ForeignKey(
        Attempt,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="answer_attempts",
    )
    student_answer = models.TextField(blank=True)

    is_correct = models.BooleanField(default=False)
    score = models.FloatField(default=0)
    mistake_type = models.CharField(max_length=100)
    weak_concept = models.CharField(max_length=255)
    ai_reason = models.TextField()
    correct_solution = models.TextField()
    interest_based_explanation = models.TextField()
    revision_task = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["question__order", "id"]

    def __str__(self) -> str:
        return f"{self.attempt.student.email} - Q{self.question.order}"
