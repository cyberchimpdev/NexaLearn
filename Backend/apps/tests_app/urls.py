from django.urls import path

from .views import TestDetailView, TestListCreateView

urlpatterns = [
    path("", TestListCreateView.as_view(), name="test-list-create"),
    path("<int:pk>/", TestDetailView.as_view(), name="test-detail"),
]
