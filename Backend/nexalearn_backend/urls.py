from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),

    path("api/auth/", include("apps.accounts.urls")),
    path("api/personalization/", include("apps.personalization.urls")),
    path("api/tests/", include("apps.tests_app.urls")),
    path("api/ai/", include("apps.ai_agent.urls")),
    path("api/attempts/", include("apps.attempts.urls")),
    path("api/reports/", include("apps.reports.urls")),
]
