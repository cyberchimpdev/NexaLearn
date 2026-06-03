import api from "./api";

export const submitAttempt = async (testId, answers) => {
  const response = await api.post("/attempts/submit/", {
    test_id: testId,
    answers,
  });

  return response.data;
};

export const submitPracticeAttempt = async (payload) => {
  const normalizedPayload = {
    title: payload?.title || "AI Practice Test",
    subject: payload?.subject || "General",
    topic: payload?.topic || "General",
    class_level: payload?.class_level || payload?.grade_level || "General",
    grade_level: payload?.grade_level || payload?.class_level || "General",
    difficulty: payload?.difficulty || "medium",

    questions: Array.isArray(payload?.questions)
      ? payload.questions.map((question, index) => ({
          order: Number(question.order || question.id || index + 1),
          id: Number(question.id || question.order || index + 1),
          question_text:
            question.question_text ||
            question.question ||
            `Question ${index + 1}`,
          correct_answer:
            question.correct_answer ||
            question.answer ||
            "Correct answer not available.",
          explanation: question.explanation || "",
          marks: Number(question.marks || 1),
        }))
      : [],

    answers: Array.isArray(payload?.answers)
      ? payload.answers.map((answer, index) => ({
          order: Number(answer.order || answer.id || index + 1),
          student_answer: answer.student_answer || answer.answer || "",
        }))
      : [],
  };

  const response = await api.post("/ai/submit-practice/", normalizedPayload);
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
  const response = await api.get("/attempts/student/");
  return response.data;
};

export const getMyAttempts = async () => {
  return getStudentAttempts();
};

export const getAttemptReport = async (attemptId) => {
  return getAttemptDetail(attemptId);
};

export const attemptService = {
  submitAttempt,
  submitPracticeAttempt,
  getStudentAttempts,
  getMyAttempts,
  getAttemptDetail,
  getAttemptMistakes,
  getAttemptReport,
};

export default attemptService;
