from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/accounts/", include("apps.accounts.urls")),
    path("api/tests/", include("apps.tests_app.urls")),
    path("api/personalization/", include("apps.personalization.urls")),
    path("api/attempts/", include("apps.attempts.urls")),
    path("api/reports/", include("apps.reports.urls")),
    path("api/ai/", include("apps.ai_agent.urls")),
]
