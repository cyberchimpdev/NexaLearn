import { api } from "./api";

export async function getStudentReport() {
  const response = await api.get("/reports/student/");
  return response.data;
}

export async function getTeacherDashboardSummary() {
  const response = await api.get("/reports/teacher-dashboard/");
  return response.data;
}

export async function getClassReport(testId) {
  const response = await api.get(`/reports/class/${testId}/`);
  return response.data;
}

export async function getWeaknessHeatmap(testId) {
  const response = await api.get(`/reports/weakness-heatmap/${testId}/`);
  return response.data;
}

export async function getRemedialGroups(testId) {
  const response = await api.get(`/reports/remedial-groups/${testId}/`);
  return response.data;
}
