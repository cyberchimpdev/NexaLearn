import { api } from "./api";

export async function analyzeAnswer(payload) {
  const response = await api.post("/ai/analyze-answer/", payload);
  return response.data;
}

export async function sendGeminiChatMessage(payload) {
  const response = await api.post("/ai/chat/", payload);
  return response.data;
}

export async function generateQuiz(payload) {
  const response = await api.post("/ai/generate-quiz/", payload);
  return response.data;
}
