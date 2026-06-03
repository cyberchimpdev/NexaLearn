from django.urls import path

from .views import (
    AttemptDetailView,
    AttemptListView,
    AttemptMistakesView,
    SubmitAttemptView,
)

urlpatterns = [
    path("", AttemptListView.as_view(), name="attempt-list"),
    path("submit/", SubmitAttemptView.as_view(), name="attempt-submit"),
    path("<int:attempt_id>/", AttemptDetailView.as_view(), name="attempt-detail"),
    path("<int:attempt_id>/mistakes/", AttemptMistakesView.as_view(), name="attempt-mistakes"),
]
