from django.contrib import admin

from .models import StudentProfile, StudentStreak


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "grade_level",
        "learning_style",
        "current_streak",
        "longest_streak",
        "last_active_date",
        "updated_at",
    )
    list_filter = (
        "grade_level",
        "learning_style",
        "last_active_date",
    )
    search_fields = (
        "user__username",
        "user__email",
        "grade_level",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(StudentStreak)
class StudentStreakAdmin(admin.ModelAdmin):
    list_display = (
        "profile",
        "date",
        "activity_type",
        "points",
        "created_at",
    )
    list_filter = (
        "date",
        "activity_type",
    )
    search_fields = (
        "profile__user__username",
        "profile__user__email",
        "activity_type",
        "note",
    )
    readonly_fields = ("created_at",)
