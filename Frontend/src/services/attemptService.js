import api from "./api";

export const submitAttempt = async (testId, answers) => {
  const payload = {
    test_id: testId,
    answers,
  };

  const response = await api.post("/attempts/submit/", payload);
  return response.data;
};

export const getAttemptDetail = async (attemptId) => {
  const response = await api.get(`/attempts/${attemptId}/`);
  return response.data;
};

export const getAttemptMistakes = async (attemptId) => {
  const response = await api.get(`/attempts/${attemptId}/mistakes/`);
  return response.data;
};

export const getStudentAttempts = async () => {
  const response = await api.get("/attempts/");
  return response.data;
};

export const getMyAttempts = async () => {
  return getStudentAttempts();
};

export const getAttemptReport = async (attemptId) => {
  const response = await api.get(`/reports/attempts/${attemptId}/`);
  return response.data;
};

export const attemptService = {
  submitAttempt,
  getAttemptDetail,
  getAttemptMistakes,
  getStudentAttempts,
  getMyAttempts,
  getAttemptReport,
};

export default attemptService;
