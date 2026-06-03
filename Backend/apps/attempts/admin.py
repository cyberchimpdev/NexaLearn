from __future__ import annotations

from django.contrib import admin

from .models import Attempt, AttemptAnswer, Mistake


class AttemptAnswerInline(admin.TabularInline):
    model = AttemptAnswer
    extra = 0
    readonly_fields = (
        "question",
        "student_answer",
        "is_correct",
        "marks_awarded",
    )
    can_delete = False


class MistakeInline(admin.TabularInline):
    model = Mistake
    extra = 0
    readonly_fields = (
        "question",
        "weak_concept",
        "mistake_type",
        "explanation",
        "personalized_explanation",
        "revision_task",
    )
    can_delete = False


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student",
        "test",
        "obtained_marks",
        "total_marks",
        "percentage",
        "created_at",
    )
    list_filter = (
        "test",
        "created_at",
    )
    search_fields = (
        "student__username",
        "student__email",
        "test__title",
    )
    readonly_fields = (
        "total_marks",
        "obtained_marks",
        "percentage",
        "created_at",
    )
    inlines = (
        AttemptAnswerInline,
        MistakeInline,
    )
    ordering = ("-created_at",)


@admin.register(AttemptAnswer)
class AttemptAnswerAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "attempt",
        "question",
        "is_correct",
        "marks_awarded",
    )
    list_filter = (
        "is_correct",
    )
    search_fields = (
        "attempt__student__username",
        "attempt__student__email",
        "question__text",
    )


@admin.register(Mistake)
class MistakeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "attempt",
        "question",
        "weak_concept",
        "mistake_type",
        "created_at",
    )
    list_filter = (
        "mistake_type",
        "weak_concept",
        "created_at",
    )
    search_fields = (
        "attempt__student__username",
        "attempt__student__email",
        "question__text",
        "weak_concept",
        "mistake_type",
    )
    readonly_fields = (
        "created_at",
    )
