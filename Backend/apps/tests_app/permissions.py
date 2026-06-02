from __future__ import annotations

from rest_framework import permissions

from apps.accounts.models import User


class IsTeacher(permissions.BasePermission):
    message = "Only teachers can perform this action."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.TEACHER
        )


class IsTeacherOwner(permissions.BasePermission):
    message = "Only the teacher who created this test can modify it."

    def has_object_permission(self, request, view, obj) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and obj.created_by == request.user
        )
