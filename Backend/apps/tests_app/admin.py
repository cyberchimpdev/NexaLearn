from django.contrib import admin

from .models import Question, Test


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "subject",
        "topic",
        "class_level",
        "difficulty",
        "created_by",
        "is_published",
        "created_at",
    ]
    list_filter = [
        "subject",
        "class_level",
        "difficulty",
        "is_published",
    ]
    search_fields = [
        "title",
        "subject",
        "topic",
        "created_by__email",
        "created_by__full_name",
    ]
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = [
        "test",
        "order",
        "question_text",
        "marks",
        "difficulty",
    ]
    list_filter = ["difficulty", "marks"]
    search_fields = ["question_text", "correct_answer"]
