from __future__ import annotations

from typing import Any

from django.conf import settings
from django.contrib.auth import authenticate
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "role",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "password",
            "role",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return email

    def validate_role(self, value: str) -> str:
        allowed_roles = {
            User.Role.TEACHER,
            User.Role.STUDENT,
        }

        if value not in allowed_roles:
            raise serializers.ValidationError("Invalid role.")

        return value

    def create(self, validated_data: dict[str, Any]) -> User:
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        email = attrs.get("email", "").strip().lower()
        password = attrs.get("password")

        if not email:
            raise serializers.ValidationError(
                {"email": "Email is required."}
            )

        if not password:
            raise serializers.ValidationError(
                {"password": "Password is required."}
            )

        user = authenticate(
            request=self.context.get("request"),
            username=email,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError(
                {"detail": "Invalid email or password."}
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {"detail": "This account is disabled."}
            )

        refresh = RefreshToken.for_user(user)

        return {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class GoogleLoginSerializer(serializers.Serializer):
    credential = serializers.CharField(write_only=True)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        credential = attrs.get("credential", "").strip()

        if not credential:
            raise serializers.ValidationError(
                {"detail": "Google credential is required."}
            )

        if not settings.GOOGLE_CLIENT_ID:
            raise serializers.ValidationError(
                {"detail": "Google OAuth is not configured in backend."}
            )

        try:
            payload = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=10,
            )
        except ValueError as exc:
            print("GOOGLE VERIFY ERROR:", str(exc))
            print("EXPECTED GOOGLE_CLIENT_ID:", settings.GOOGLE_CLIENT_ID)

            raise serializers.ValidationError(
                {"detail": "Invalid Google credential."}
            )

        email = payload.get("email", "").strip().lower()
        full_name = payload.get("name") or ""
        email_verified = payload.get("email_verified", False)

        if not email:
            raise serializers.ValidationError(
                {"detail": "Google account email was not provided."}
            )

        if not email_verified:
            raise serializers.ValidationError(
                {"detail": "Google email is not verified."}
            )

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "full_name": full_name or email.split("@")[0],
                "role": User.Role.STUDENT,
            },
        )

        if created:
            user.set_unusable_password()
            user.save(update_fields=["password"])

        if not user.is_active:
            raise serializers.ValidationError(
                {"detail": "This account is disabled."}
            )

        refresh = RefreshToken.for_user(user)

        return {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "is_new_user": created,
        }
