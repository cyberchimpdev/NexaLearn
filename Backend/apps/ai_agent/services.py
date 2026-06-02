from __future__ import annotations

from .agent import NexaLearnAgent
from .schemas import AnswerAnalysisInput, AnswerAnalysisOutput


class AIAnalysisService:
    def __init__(self) -> None:
        self.agent = NexaLearnAgent()

    def analyze_answer(self, payload: AnswerAnalysisInput) -> AnswerAnalysisOutput:
        return self.agent.analyze_answer(payload)
