import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

import {
  generateStudentPracticeQuiz,
  submitAIPractice,
} from "../../services/aiService";

const defaultForm = {
  subject: "Physics",
  topic: "Electric Field",
  studentClass: "12",
  difficulty: "Medium",
  totalQuestions: 5,
  marksPerQuestion: 2,
};

const getQuestionText = (question) =>
  question?.question ||
  question?.question_text ||
  question?.text ||
  "Question text unavailable";

const getQuestionId = (question, index) => String(question?.id ?? index + 1);

const normalizeGeneratedQuestions = (questions) => {
  if (!Array.isArray(questions)) return [];

  return questions.map((question, index) => {
    const questionText = getQuestionText(question);

    return {
      id: question?.id ?? question?.question_id ?? index + 1,
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
      student_class: question?.student_class || question?.studentClass || "12",
      difficulty: question?.difficulty || "Medium",
      marks: Number(question?.marks || question?.mark || 1),
    };
  });
};

export default function AIPracticeTest() {
  const [form, setForm] = useState(defaultForm);
  const [practiceTest, setPracticeTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");

  const totalMarks = useMemo(() => {
    if (practiceTest?.total_marks) return practiceTest.total_marks;

    return questions.reduce(
      (sum, question) =>
        sum + Number(question.marks || form.marksPerQuestion || 1),
      0,
    );
  }, [form.marksPerQuestion, practiceTest, questions]);

  const answeredCount = useMemo(() => {
    return questions.filter((question, index) => {
      const id = getQuestionId(question, index);
      return Boolean(String(answers[id] || "").trim());
    }).length;
  }, [answers, questions]);

  const progressPercentage = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round((answeredCount / questions.length) * 100);
  }, [answeredCount, questions.length]);

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGeneratePractice = async () => {
    setLoadingGenerate(true);
    setError("");
    setResult(null);

    try {
      const data = await generateStudentPracticeQuiz({
        subject: form.subject,
        topic: form.topic,
        studentClass: form.studentClass,
        difficulty: form.difficulty,
        totalQuestions: form.totalQuestions,
        marksPerQuestion: form.marksPerQuestion,
        interests: [],
      });

      const generatedQuestions = normalizeGeneratedQuestions(data.questions);

      if (!generatedQuestions.length) {
        setError("No questions were generated. Try another subject or topic.");
        setQuestions([]);
        setPracticeTest(null);
        return;
      }

      setPracticeTest({
        ...data,
        questions: generatedQuestions,
      });
      setQuestions(generatedQuestions);
      setAnswers({});
    } catch (err) {
      console.error("AI practice generation failed:", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });

      const status = err?.response?.status;

      if (status === 401) {
        setError("Login token expired. Log out and log in again.");
      } else if (status === 404) {
        setError(
          "AI practice route not found. Check backend /api/ai/practice/generate/.",
        );
      } else if (status === 400) {
        setError(
          "Invalid AI practice form data. Check subject, topic, class, and marks.",
        );
      } else if (status === 500) {
        setError(
          "Backend crashed while generating quiz. Check Django terminal.",
        );
      } else {
        setError("Failed to generate AI practice test. Check backend server.");
      }
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: value,
    }));
  };

  const handleSubmitPractice = async () => {
    if (!questions.length) {
      setError("Generate a practice test first.");
      return;
    }

    setLoadingSubmit(true);
    setError("");

    try {
      const data = await submitAIPractice({
        questions,
        answers,
        subject: form.subject,
        topic: form.topic,
        studentClass: form.studentClass,
        interests: [],
      });

      setResult(data);
    } catch (err) {
      console.error("AI practice submission failed:", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });

      const status = err?.response?.status;

      if (status === 401) {
        setError("Login token expired. Log out and log in again.");
      } else if (status === 404) {
        setError("AI practice evaluation route not found.");
      } else if (status === 400) {
        setError(
          "Invalid submission payload. Check generated questions and answers.",
        );
      } else if (status === 500) {
        setError("Backend crashed during evaluation. Check Django terminal.");
      } else {
        setError("Failed to submit AI practice test.");
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
                <Sparkles size={16} />
                AI Practice Generator
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Generate a clean topic-based test.
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-600">
                Create a random practice paper from any subject and topic.
                Submit your answers to get score, weak concepts, explanations,
                and recovery tasks.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-bold text-slate-500">Answered</p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {answeredCount}/{questions.length || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-bold text-slate-500">Progress</p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {progressPercentage}%
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-bold text-slate-500">Marks</p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {totalMarks}
                </p>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-bold text-red-700">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_0.7fr_0.8fr_0.7fr_0.7fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-black text-slate-900">
                Subject
              </label>
              <input
                value={form.subject}
                onChange={(event) => updateForm("subject", event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-900">
                Topic
              </label>
              <input
                value={form.topic}
                onChange={(event) => updateForm("topic", event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-900">
                Class
              </label>
              <input
                value={form.studentClass}
                onChange={(event) =>
                  updateForm("studentClass", event.target.value)
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-900">
                Difficulty
              </label>
              <select
                value={form.difficulty}
                onChange={(event) =>
                  updateForm("difficulty", event.target.value)
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-900">
                Questions
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={form.totalQuestions}
                onChange={(event) =>
                  updateForm("totalQuestions", Number(event.target.value))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-900">
                Marks
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={form.marksPerQuestion}
                onChange={(event) =>
                  updateForm("marksPerQuestion", Number(event.target.value))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleGeneratePractice}
                disabled={loadingGenerate}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingGenerate ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Sparkles size={18} />
                )}
                Generate
              </button>
            </div>
          </div>
        </section>

        {practiceTest ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span className="inline-flex rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
                  Class {practiceTest.student_class || form.studentClass}
                </span>

                <p className="mt-4 text-sm font-black text-slate-600">
                  {practiceTest.subject || form.subject} •{" "}
                  {practiceTest.topic || form.topic} •{" "}
                  {practiceTest.difficulty || form.difficulty}
                </p>

                <p className="mt-2 text-xs font-bold text-slate-500">
                  Provider: {practiceTest.provider || "local"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">Questions</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {questions.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">
                    Total Marks
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {totalMarks}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {questions.length > 0 ? (
          <section className="space-y-5">
            {questions.map((question, index) => {
              const questionId = getQuestionId(question, index);
              const questionText = getQuestionText(question);

              return (
                <article
                  key={questionId}
                  className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="inline-flex rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
                        Question {index + 1}
                      </span>

                      <h3 className="mt-4 text-lg font-black leading-relaxed text-slate-950">
                        {questionText}
                      </h3>

                      {question.weak_concept ? (
                        <p className="mt-2 text-xs font-bold text-slate-500">
                          Concept: {question.weak_concept}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                      <p className="text-xs font-bold text-slate-500">Marks</p>
                      <p className="text-xl font-black text-slate-950">
                        {question.marks || form.marksPerQuestion}
                      </p>
                    </div>
                  </div>

                  {Array.isArray(question.options) &&
                  question.options.length > 0 ? (
                    <div className="mb-5 grid gap-3 sm:grid-cols-2">
                      {question.options.map((option) => (
                        <label
                          key={`${questionId}-${option}`}
                          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                        >
                          <input
                            type="radio"
                            name={`question-${questionId}`}
                            value={option}
                            checked={answers[questionId] === option}
                            onChange={(event) =>
                              handleAnswerChange(questionId, event.target.value)
                            }
                            className="h-4 w-4 accent-indigo-600"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : null}

                  <label className="mb-2 block text-sm font-black text-slate-900">
                    Your Answer
                  </label>

                  <textarea
                    value={answers[questionId] || ""}
                    onChange={(event) =>
                      handleAnswerChange(questionId, event.target.value)
                    }
                    placeholder="Write your answer here..."
                    className="min-h-36 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </article>
              );
            })}

            <div className="sticky bottom-6 flex justify-end">
              <button
                type="button"
                onClick={handleSubmitPractice}
                disabled={loadingSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-7 py-4 text-sm font-black text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingSubmit ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
                Submit AI Practice
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <BookOpenCheck className="mx-auto text-slate-300" size={46} />
            <h2 className="mt-5 text-xl font-black text-slate-950">
              No practice test generated yet
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Select subject, topic, class, difficulty, then click Generate.
            </p>
          </section>
        )}

        {result ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                  <Target size={16} />
                  AI Evaluation Result
                </div>

                <h2 className="mt-4 text-2xl font-black text-slate-950">
                  Score: {result.obtained_marks ?? 0}/{result.total_marks ?? 0}
                </h2>

                <p className="mt-2 text-sm font-bold text-slate-600">
                  Percentage: {result.percentage ?? 0}% • Correct:{" "}
                  {result.correct_count ?? 0} • Wrong: {result.wrong_count ?? 0}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-5 py-4">
                <p className="text-xs font-bold text-slate-500">
                  Weak Concepts
                </p>
                <p className="mt-2 text-sm font-black text-slate-900">
                  {Array.isArray(result.weak_concepts) &&
                  result.weak_concepts.length > 0
                    ? result.weak_concepts.join(", ")
                    : "No major weak concept detected"}
                </p>
              </div>
            </div>

            {Array.isArray(result.results) && result.results.length > 0 ? (
              <div className="mt-6 space-y-4">
                {result.results.map((item, index) => (
                  <div
                    key={item.question_id || index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      {item.is_correct ? (
                        <CheckCircle2
                          className="mt-1 text-emerald-600"
                          size={20}
                        />
                      ) : (
                        <XCircle className="mt-1 text-red-600" size={20} />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-slate-950">
                          Question {index + 1}: {item.question}
                        </p>

                        <p className="mt-2 text-sm font-bold text-slate-600">
                          Your answer: {item.student_answer || "Blank"}
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-600">
                          Correct answer: {item.correct_answer}
                        </p>

                        <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
                          {item.explanation}
                        </p>

                        <p className="mt-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-700">
                          Revision task: {item.revision_task}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}
