from django.contrib import admin

from .models import StudentProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "class_level",
        "primary_interest",
        "explanation_style",
        "updated_at",
    ]
    list_filter = ["class_level", "primary_interest", "explanation_style"]
    search_fields = ["user__email", "user__full_name"]
