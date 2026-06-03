from django.urls import path

from .views import (
    AIHealthCheckView,
    AIPracticeEvaluateView,
    AIPracticeGenerateView,
    AnalyzeAnswerView,
    TutorAIChatView,
)

urlpatterns = [
    path("health/", AIHealthCheckView.as_view(), name="ai-health"),
    path("chat/", TutorAIChatView.as_view(), name="ai-chat"),
    path("analyze-answer/", AnalyzeAnswerView.as_view(), name="ai-analyze-answer"),

    path("practice/generate/", AIPracticeGenerateView.as_view(), name="ai-practice-generate"),
    path("practice/evaluate/", AIPracticeEvaluateView.as_view(), name="ai-practice-evaluate"),

    path("generate-quiz/", AIPracticeGenerateView.as_view(), name="ai-generate-quiz"),
    path("quiz/generate/", AIPracticeGenerateView.as_view(), name="ai-quiz-generate"),
    path("quiz/evaluate/", AIPracticeEvaluateView.as_view(), name="ai-quiz-evaluate"),
]
