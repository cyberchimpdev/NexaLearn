from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def api_root(request):
    return JsonResponse(
        {
            "message": "NexaLearn API is running",
            "routes": {
                "auth": "/api/auth/",
                "accounts": "/api/accounts/",
                "personalization": "/api/personalization/",
                "tests": "/api/tests/",
                "attempts": "/api/attempts/",
                "reports": "/api/reports/",
                "ai": "/api/ai/",
            },
        }
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api_root, name="api-root"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/accounts/", include("apps.accounts.urls")),
    path("api/personalization/", include("apps.personalization.urls")),
    path("api/tests/", include("apps.tests_app.urls")),
    path("api/attempts/", include("apps.attempts.urls")),
    path("api/reports/", include("apps.reports.urls")),
    path("api/ai/", include("apps.ai_agent.urls")),
]
