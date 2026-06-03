import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Save,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { submitAttempt } from "../../services/attemptService";

function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const normalizeQuestions = (data) => {
    if (Array.isArray(data?.questions)) return data.questions;
    if (Array.isArray(data?.test?.questions)) return data.test.questions;
    return [];
  };

  const fetchTest = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/tests/${testId}/`);
      const testData = response.data?.test || response.data;

      setTest({
        ...testData,
        questions: normalizeQuestions(response.data),
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Could not load test. Check backend route: /api/tests/:id/",
      );
    } finally {
      setLoading(false);
    }
  };

  const questions = useMemo(() => {
    return Array.isArray(test?.questions) ? test.questions : [];
  }, [test]);

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter((value) => String(value).trim())
      .length;
  }, [answers]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));
  };

  const buildPayloadAnswers = () => {
    return questions.map((question, index) => {
      const questionId = question.id || question.question_id || index + 1;

      return {
        question_id: questionId,
        answer: answers[questionId] || "",
        student_answer: answers[questionId] || "",
      };
    });
  };

  const handleSubmit = async () => {
    if (questions.length === 0) {
      setError("This test has no questions.");
      return;
    }

    if (answeredCount === 0) {
      setError("Please answer at least one question before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await submitAttempt(testId, buildPayloadAnswers());

      const attemptId =
        response?.id ||
        response?.attempt_id ||
        response?.attempt?.id ||
        response?.data?.id;

      if (attemptId) {
        navigate(`/student/reports/${attemptId}/mistakes`);
        return;
      }

      navigate("/student/reports");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Could not submit attempt. Check backend route: /api/attempts/submit/",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-700">
              Loading test...
            </p>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <Link
              to="/student/tests"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to tests
            </Link>

            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {test?.title || "Diagnostic Test"}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {test?.description ||
                    "Answer the questions below. NexaLearn will analyze your answers and detect weak concepts."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <InfoBadge
                    icon={BookOpen}
                    text={test?.subject || "General"}
                  />
                  <InfoBadge
                    icon={Clock}
                    text={`${test?.duration_minutes || 30} min`}
                  />
                  <InfoBadge
                    icon={CheckCircle2}
                    text={`${answeredCount}/${questions.length} answered`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {submitting ? "Submitting..." : "Submit Test"}
              </button>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {questions.length === 0 ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">
                No questions found
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                This test does not have questions yet.
              </p>
            </section>
          ) : (
            <section className="space-y-5">
              {questions.map((question, index) => {
                const questionId =
                  question.id || question.question_id || index + 1;

                return (
                  <article
                    key={questionId}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-indigo-600">
                          Question {index + 1}
                        </p>

                        <h2 className="mt-2 text-base font-semibold leading-7 text-slate-950">
                          {question.question_text ||
                            question.text ||
                            question.question ||
                            "Question text unavailable"}
                        </h2>
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {question.marks || 1} marks
                      </span>
                    </div>

                    {question.question_type === "mcq" &&
                    Array.isArray(question.options) &&
                    question.options.length > 0 ? (
                      <div className="mt-5 space-y-3">
                        {question.options.map((option, optionIndex) => (
                          <label
                            key={`${questionId}-${optionIndex}`}
                            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
                          >
                            <input
                              type="radio"
                              name={`question-${questionId}`}
                              value={option}
                              checked={answers[questionId] === option}
                              onChange={(event) =>
                                handleAnswerChange(
                                  questionId,
                                  event.target.value,
                                )
                              }
                              className="h-4 w-4 text-indigo-600"
                            />
                            <span className="text-sm font-medium text-slate-700">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={answers[questionId] || ""}
                        onChange={(event) =>
                          handleAnswerChange(questionId, event.target.value)
                        }
                        rows={5}
                        placeholder="Write your answer here..."
                        className="mt-5 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                    )}
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}

function InfoBadge({ icon: Icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

export default TakeTest;
