from django.contrib import admin

from .models import ClassReportSnapshot, RemedialGroup


@admin.register(ClassReportSnapshot)
class ClassReportSnapshotAdmin(admin.ModelAdmin):
    list_display = [
        "test",
        "total_attempts",
        "average_score",
        "average_percentage",
        "most_common_mistake_type",
        "most_common_weak_concept",
        "generated_at",
    ]
    list_filter = [
        "test__subject",
        "test__class_level",
        "most_common_mistake_type",
        "generated_at",
    ]
    search_fields = [
        "test__title",
        "test__subject",
        "test__topic",
        "most_common_weak_concept",
        "most_common_mistake_type",
    ]
    readonly_fields = [
        "test",
        "total_attempts",
        "average_score",
        "average_percentage",
        "most_common_weak_concept",
        "most_common_mistake_type",
        "suggested_teacher_action",
        "generated_at",
    ]


@admin.register(RemedialGroup)
class RemedialGroupAdmin(admin.ModelAdmin):
    list_display = [
        "group_name",
        "test",
        "mistake_type",
        "weak_concept",
        "student_count",
        "generated_at",
    ]
    list_filter = [
        "mistake_type",
        "test__subject",
        "test__class_level",
        "generated_at",
    ]
    search_fields = [
        "group_name",
        "test__title",
        "weak_concept",
        "mistake_type",
    ]
    readonly_fields = [
        "test",
        "group_name",
        "mistake_type",
        "weak_concept",
        "suggested_action",
        "student_count",
        "generated_at",
    ]
