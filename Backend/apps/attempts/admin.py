from django.contrib import admin

from .models import AnswerAttempt, Attempt


class AnswerAttemptInline(admin.TabularInline):
    model = AnswerAttempt
    extra = 0
    readonly_fields = [
        "is_correct",
        "score",
        "mistake_type",
        "weak_concept",
        "ai_reason",
        "correct_solution",
        "interest_based_explanation",
        "revision_task",
        "created_at",
    ]


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "test",
        "total_score",
        "total_marks",
        "percentage",
        "submitted_at",
    ]
    list_filter = ["test__subject", "test__class_level", "submitted_at"]
    search_fields = [
        "student__email",
        "student__full_name",
        "test__title",
    ]
    inlines = [AnswerAttemptInline]


@admin.register(AnswerAttempt)
class AnswerAttemptAdmin(admin.ModelAdmin):
    list_display = [
        "attempt",
        "question",
        "is_correct",
        "score",
        "mistake_type",
        "weak_concept",
    ]
    list_filter = ["is_correct", "mistake_type"]
    search_fields = [
        "attempt__student__email",
        "question__question_text",
        "weak_concept",
    ]
