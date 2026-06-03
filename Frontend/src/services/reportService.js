import api from "./api";

export const getStudentReports = async () => {
  const response = await api.get("/reports/student/");
  return response.data;
};

export const getStudentReport = getStudentReports;
export const fetchStudentReports = getStudentReports;
export const fetchStudentReport = getStudentReports;

export const getTeacherTestReport = async (testId) => {
  const response = await api.get(`/reports/teacher/tests/${testId}/`);
  return response.data;
};

export const fetchTeacherTestReport = getTeacherTestReport;
