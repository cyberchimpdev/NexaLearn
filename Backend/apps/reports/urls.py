from django.urls import path

from .views import StudentReportView, TeacherTestReportView

urlpatterns = [
    path("student/", StudentReportView.as_view(), name="student-report"),
    path("student", StudentReportView.as_view(), name="student-report-no-slash"),

    path("teacher/tests/<int:test_id>/", TeacherTestReportView.as_view(), name="teacher-test-report"),
    path("teacher/tests/<int:test_id>", TeacherTestReportView.as_view(), name="teacher-test-report-no-slash"),
]
