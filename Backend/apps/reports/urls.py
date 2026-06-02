from django.urls import path

from .views import (
    ClassReportView,
    RemedialGroupsView,
    StudentReportView,
    TeacherDashboardSummaryView,
    WeaknessHeatmapView,
)

urlpatterns = [
    path("student/", StudentReportView.as_view(), name="student-report"),
    path("teacher-dashboard/", TeacherDashboardSummaryView.as_view(), name="teacher-dashboard-summary"),
    path("class/<int:test_id>/", ClassReportView.as_view(), name="class-report"),
    path("weakness-heatmap/<int:test_id>/", WeaknessHeatmapView.as_view(), name="weakness-heatmap"),
    path("remedial-groups/<int:test_id>/", RemedialGroupsView.as_view(), name="remedial-groups"),
]
