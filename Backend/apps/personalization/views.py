from __future__ import annotations

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User

from .models import StudentProfile
from .serializers import StudentProfileSerializer


class StudentProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.role != User.Role.STUDENT:
            return Response(
                {"detail": "Only students have learning profiles."},
                status=status.HTTP_403_FORBIDDEN,
            )

        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        if request.user.role != User.Role.STUDENT:
            return Response(
                {"detail": "Only students can update learning profile."},
                status=status.HTTP_403_FORBIDDEN,
            )

        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        serializer = StudentProfileSerializer(
            profile,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)


class PersonalizationOptionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "interests": [
                    {"value": value, "label": label}
                    for value, label in StudentProfile.Interest.choices
                ],
                "explanation_styles": [
                    {"value": value, "label": label}
                    for value, label in StudentProfile.ExplanationStyle.choices
                ],
                "class_levels": [
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "11",
                    "12",
                    "SEE",
                    "NEB",
                    "SAT",
                    "IELTS",
                    "PTE",
                ],
            },
            status=status.HTTP_200_OK,
        )
