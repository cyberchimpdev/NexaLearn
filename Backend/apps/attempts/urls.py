from django.urls import path

from .views import AttemptDetailView, StudentAttemptListView, SubmitAttemptView

urlpatterns = [
    path("submit/", SubmitAttemptView.as_view(), name="submit-attempt"),
    path("student/", StudentAttemptListView.as_view(), name="student-attempts"),
    path("<int:pk>/", AttemptDetailView.as_view(), name="attempt-detail"),
]
