from __future__ import annotations

from django.db import models

from apps.tests_app.models import Test


class ClassReportSnapshot(models.Model):
    test = models.OneToOneField(
        Test,
        on_delete=models.CASCADE,
        related_name="report_snapshot",
    )
    total_attempts = models.PositiveIntegerField(default=0)
    average_score = models.FloatField(default=0)
    average_percentage = models.FloatField(default=0)
    most_common_weak_concept = models.CharField(max_length=255, blank=True)
    most_common_mistake_type = models.CharField(max_length=100, blank=True)
    suggested_teacher_action = models.TextField(blank=True)
    generated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-generated_at"]

    def __str__(self) -> str:
        return f"Report Snapshot - {self.test.title}"


class RemedialGroup(models.Model):
    test = models.ForeignKey(
        Test,
        on_delete=models.CASCADE,
        related_name="remedial_groups",
    )
    group_name = models.CharField(max_length=255)
    mistake_type = models.CharField(max_length=100)
    weak_concept = models.CharField(max_length=255)
    suggested_action = models.TextField()
    student_count = models.PositiveIntegerField(default=0)
    generated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-student_count", "group_name"]
        unique_together = ["test", "mistake_type", "weak_concept"]

    def __str__(self) -> str:
        return f"{self.group_name} - {self.test.title}"
