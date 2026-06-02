import { api } from "./api";

export async function getTests() {
  const response = await api.get("/tests/");
  return response.data;
}

export async function getTestDetail(testId) {
  const response = await api.get(`/tests/${testId}/`);
  return response.data;
}

export async function createTest(payload) {
  const response = await api.post("/tests/", payload);
  return response.data;
}

export async function updateTest(testId, payload) {
  const response = await api.put(`/tests/${testId}/`, payload);
  return response.data;
}

export async function deleteTest(testId) {
  const response = await api.delete(`/tests/${testId}/`);
  return response.data;
}
