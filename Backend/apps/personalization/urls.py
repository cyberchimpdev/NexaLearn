from django.urls import path

from .views import (
    LearningProfileSummaryView,
    StudentProfileCreateView,
    StudentProfileView,
    StudentStreakView,
)

urlpatterns = [
    path("profile/", StudentProfileView.as_view(), name="student-profile"),
    path("profile/create/", StudentProfileCreateView.as_view(), name="student-profile-create"),
    path("profile/summary/", LearningProfileSummaryView.as_view(), name="learning-profile-summary"),
    path("streak/", StudentStreakView.as_view(), name="student-streak"),
]
