from django.urls import path

from .views import PersonalizationOptionsView, StudentProfileView

urlpatterns = [
    path("profile/", StudentProfileView.as_view(), name="student-profile"),
    path("options/", PersonalizationOptionsView.as_view(), name="personalization-options"),
]
