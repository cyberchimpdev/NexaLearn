from __future__ import annotations

from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from apps.accounts.models import User

from .models import Test
from .serializers import TestDetailSerializer, TestListSerializer


class TestListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = (
            Test.objects.select_related("created_by")
            .prefetch_related("questions")
            .all()
        )

        user = self.request.user

        if user.role == User.Role.TEACHER:
            return queryset.filter(created_by=user)

        return queryset.filter(is_published=True)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TestDetailSerializer

        return TestListSerializer

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.TEACHER:
            raise PermissionDenied("Only teachers can create tests.")

        serializer.save()


class TestDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TestDetailSerializer

    def get_queryset(self):
        return (
            Test.objects.select_related("created_by")
            .prefetch_related("questions")
            .all()
        )

    def get_object(self):
        test = super().get_object()

        if self.request.user.role == User.Role.STUDENT and not test.is_published:
            raise PermissionDenied("This test is not available for students.")

        return test

    def perform_update(self, serializer):
        test = self.get_object()

        if self.request.user.role != User.Role.TEACHER:
            raise PermissionDenied("Only teachers can update tests.")

        if test.created_by != self.request.user:
            raise PermissionDenied("You can only update your own test.")

        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != User.Role.TEACHER:
            raise PermissionDenied("Only teachers can delete tests.")

        if instance.created_by != self.request.user:
            raise PermissionDenied("You can only delete your own test.")

        instance.delete()
