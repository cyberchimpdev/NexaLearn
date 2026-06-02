from __future__ import annotations

from rest_framework import permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.attempts.models import Attempt
from apps.tests_app.models import Test

from .serializers import ClassReportSnapshotSerializer
from .services import ReportService


class StudentReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.STUDENT:
            raise PermissionDenied("Only students can view student reports.")

        attempts = (
            Attempt.objects.select_related("test")
            .filter(student=request.user)
            .order_by("-submitted_at")
        )

        data = [
            {
                "attempt_id": attempt.id,
                "test_id": attempt.test.id,
                "test_title": attempt.test.title,
                "subject": attempt.test.subject,
                "topic": attempt.test.topic,
                "class_level": attempt.test.class_level,
                "total_score": attempt.total_score,
                "total_marks": attempt.total_marks,
                "percentage": attempt.percentage,
                "submitted_at": attempt.submitted_at,
            }
            for attempt in attempts
        ]

        return Response(data, status=status.HTTP_200_OK)


class ClassReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, test_id: int):
        if request.user.role != User.Role.TEACHER:
            raise PermissionDenied("Only teachers can view class reports.")

        test = Test.objects.filter(id=test_id, created_by=request.user).first()

        if test is None:
            raise PermissionDenied("Test not found or not owned by you.")

        report_data = ReportService.build_class_report(test)
        snapshot_serializer = ClassReportSnapshotSerializer(report_data["snapshot"])

        return Response(
            {
                "summary": snapshot_serializer.data,
                "student_results": report_data["student_results"],
            },
            status=status.HTTP_200_OK,
        )


class WeaknessHeatmapView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, test_id: int):
        if request.user.role != User.Role.TEACHER:
            raise PermissionDenied("Only teachers can view weakness heatmap.")

        test = Test.objects.filter(id=test_id, created_by=request.user).first()

        if test is None:
            raise PermissionDenied("Test not found or not owned by you.")

        data = ReportService.build_weakness_heatmap(test)
        return Response(data, status=status.HTTP_200_OK)


class RemedialGroupsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, test_id: int):
        if request.user.role != User.Role.TEACHER:
            raise PermissionDenied("Only teachers can view remedial groups.")

        test = Test.objects.filter(id=test_id, created_by=request.user).first()

        if test is None:
            raise PermissionDenied("Test not found or not owned by you.")

        groups = ReportService.build_remedial_groups(test)

        return Response(
            {
                "test_id": test.id,
                "test_title": test.title,
                "subject": test.subject,
                "topic": test.topic,
                "class_level": test.class_level,
                "remedial_groups": groups,
            },
            status=status.HTTP_200_OK,
        )


class TeacherDashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.TEACHER:
            raise PermissionDenied("Only teachers can view dashboard summary.")

        tests = Test.objects.filter(created_by=request.user).prefetch_related("attempts")

        total_tests = tests.count()
        total_attempts = sum(test.attempts.count() for test in tests)

        latest_tests = [
            {
                "id": test.id,
                "title": test.title,
                "subject": test.subject,
                "topic": test.topic,
                "class_level": test.class_level,
                "attempt_count": test.attempts.count(),
                "created_at": test.created_at,
            }
            for test in tests[:5]
        ]

        return Response(
            {
                "total_tests": total_tests,
                "total_attempts": total_attempts,
                "latest_tests": latest_tests,
            },
            status=status.HTTP_200_OK,
        )
