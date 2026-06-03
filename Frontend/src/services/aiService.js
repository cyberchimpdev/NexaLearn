import api from "./api";

const normalizeQuestion = (question, index = 0) => {
  const questionText =
    question?.question_text ||
    question?.question ||
    question?.text ||
    question?.title ||
    "";

  const id =
    question?.id ?? question?.question_id ?? question?.order ?? index + 1;

  return {
    ...question,
    id,
    order: question?.order ?? id,
    question: questionText,
    question_text: questionText,
    text: questionText,
    options: Array.isArray(question?.options) ? question.options : [],
    correct_answer:
      question?.correct_answer ||
      question?.correctAnswer ||
      question?.answer ||
      "",
    explanation: question?.explanation || "",
    weak_concept:
      question?.weak_concept ||
      question?.weakConcept ||
      question?.topic ||
      "General",
    subject: question?.subject || "General",
    topic: question?.topic || "General",
    class_level:
      question?.class_level ||
      question?.student_class ||
      question?.studentClass ||
      "12",
    student_class:
      question?.student_class ||
      question?.class_level ||
      question?.studentClass ||
      "12",
    difficulty: question?.difficulty || "medium",
    marks: Number(question?.marks || question?.mark || 1),
  };
};

const buildReadableError = (error, fallback) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status === 401) return "Login token expired. Log out and log in again.";
  if (status === 404) return "AI route not found. Check backend URLs.";
  if (status === 400) return data?.detail || "Invalid request data.";
  if (status === 500) return "Backend crashed. Check Django terminal.";

  return fallback;
};

export const sendGeminiChatMessage = async ({
  message,
  subject = "General",
  topic = "General",
  studentClass = "12",
  learningStyle = "",
  interests = [],
}) => {
  try {
    const response = await api.post("/ai/chat/", {
      message,
      subject,
      topic,
      student_class: studentClass,
      learning_style: learningStyle,
      interests,
    });

    return response.data;
  } catch (error) {
    console.error("Tutor AI chat failed:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });

    error.readableMessage = buildReadableError(
      error,
      "Tutor AI unavailable. Check backend server.",
    );

    throw error;
  }
};

export const sendTutorAIMessage = sendGeminiChatMessage;

export const generateStudentPracticeQuiz = async (payload) => {
  const subject = payload.subject;
  const topic = payload.topic;

  const studentClass =
    payload.studentClass ||
    payload.student_class ||
    payload.class_level ||
    payload.grade_level ||
    "12";

  const totalQuestions =
    payload.totalQuestions ||
    payload.total_questions ||
    payload.question_count ||
    payload.count ||
    5;

  const marksPerQuestion =
    payload.marksPerQuestion || payload.marks_per_question || 2;

  try {
    const response = await api.post("/ai/practice/generate/", {
      subject,
      topic,
      student_class: studentClass,
      class_level: studentClass,
      difficulty: payload.difficulty || "medium",
      total_questions: Number(totalQuestions),
      question_count: Number(totalQuestions),
      marks_per_question: Number(marksPerQuestion),
      interests: payload.interests || [],
    });

    const data = response.data;
    const rawQuestions = Array.isArray(data.questions) ? data.questions : [];

    return {
      ...data,
      class_level: data.class_level || data.student_class || studentClass,
      student_class: data.student_class || data.class_level || studentClass,
      source: data.source || data.provider || "gemini",
      provider: data.provider || data.source || "gemini",
      questions: rawQuestions.map(normalizeQuestion),
    };
  } catch (error) {
    console.error("AI practice generation failed:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });

    error.readableMessage = buildReadableError(
      error,
      "Failed to generate AI practice test. Check backend server.",
    );

    throw error;
  }
};

export const submitAIPractice = async (payload) => {
  const subject = payload.subject || "General";
  const topic = payload.topic || "General";

  const studentClass =
    payload.studentClass ||
    payload.student_class ||
    payload.class_level ||
    "12";

  const questions = Array.isArray(payload.questions)
    ? payload.questions.map(normalizeQuestion)
    : [];

  const answers = payload.answers || {};

  try {
    const response = await api.post("/ai/practice/evaluate/", {
      questions,
      answers,
      subject,
      topic,
      student_class: studentClass,
      class_level: studentClass,
      interests: payload.interests || [],
    });

    return response.data;
  } catch (error) {
    console.error("AI practice evaluation failed:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });

    error.readableMessage = buildReadableError(
      error,
      "Failed to submit practice test for analysis.",
    );

    throw error;
  }
};

export const analyzeAnswerWithAI = async ({
  questionText,
  correctAnswer,
  studentAnswer,
  subject = "General",
  topic = "General",
  difficulty = "medium",
  questionType = "short_answer",
  marks = 1,
  studentClass = "12",
  learningStyle = "",
  interests = [],
}) => {
  const response = await api.post("/ai/analyze-answer/", {
    question_text: questionText,
    correct_answer: correctAnswer,
    student_answer: studentAnswer,
    subject,
    topic,
    difficulty,
    question_type: questionType,
    marks,
    student_class: studentClass,
    learning_style: learningStyle,
    interests,
  });

  return response.data;
};

export const generateAIPracticeTest = generateStudentPracticeQuiz;
export const evaluateAIPracticeTest = submitAIPractice;
export const evaluateStudentPracticeQuiz = submitAIPractice;
