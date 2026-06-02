import { api } from "./api";

export async function submitAttempt(payload) {
  const response = await api.post("/attempts/submit/", payload);
  return response.data;
}

export async function getStudentAttempts() {
  const response = await api.get("/attempts/student/");
  return response.data;
}

export async function getAttemptDetail(attemptId) {
  const response = await api.get(`/attempts/${attemptId}/`);
  return response.data;
}
