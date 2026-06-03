from django.urls import path

from .views import AnalyzeAnswerView, GeminiChatView, GenerateQuizView

urlpatterns = [
    path("analyze-answer/", AnalyzeAnswerView.as_view(), name="analyze-answer"),
    path("chat/", GeminiChatView.as_view(), name="gemini-chat"),
    path("generate-quiz/", GenerateQuizView.as_view(), name="generate-quiz"),
]
