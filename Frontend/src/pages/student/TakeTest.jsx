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

  function normalizeQuestions(data) {
    if (Array.isArray(data?.questions)) return data.questions;
    if (Array.isArray(data?.test?.questions)) return data.test.questions;
    return [];
  }

  async function fetchTest() {
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
  }

  const questions = useMemo(() => {
    return Array.isArray(test?.questions) ? test.questions : [];
  }, [test]);

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter((value) => String(value).trim())
      .length;
  }, [answers]);

  const progress =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  function handleAnswerChange(questionId, value) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));
  }

  function buildPayloadAnswers() {
    return questions.map((question, index) => {
      const questionId = question.id || question.question_id || index + 1;

      return {
        question_id: questionId,
        answer: answers[questionId] || "",
        student_answer: answers[questionId] || "",
      };
    });
  }

  async function handleSubmit() {
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
  }

  if (loading) {
    return (
      <DashboardLayout title="Take Test">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
            <p className="text-sm font-semibold text-slate-700">
              Loading test...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Take Test">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_52%,#22c55e_100%)] p-6 text-white shadow-xl shadow-sky-500/15 sm:p-8">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
            <div>
              <Link
                to="/student/tests"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to tests
              </Link>

              <h1 className="mt-6 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                {test?.title || "Diagnostic Test"}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-sky-50 sm:text-base">
                {test?.description ||
                  "Answer the questions below. NexaLearn will analyze your answers and detect weak concepts."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <InfoBadge icon={BookOpen} text={test?.subject || "General"} />
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

            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-bold text-sky-100">Progress</p>
              <p className="mt-2 text-4xl font-black text-white">{progress}%</p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-white transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-sky-700 shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {submitting ? "Submitting..." : "Submit Test"}
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </section>
        ) : null}

        {questions.length === 0 ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-5 text-xl font-black text-slate-950">
              No questions found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              This test does not have questions yet.
            </p>
          </section>
        ) : (
          <section className="space-y-5">
            {questions.map((question, index) => {
              const questionId =
                question.id || question.question_id || index + 1;

              return (
                <QuestionCard
                  key={questionId}
                  question={question}
                  index={index}
                  questionId={questionId}
                  value={answers[questionId] || ""}
                  onChange={handleAnswerChange}
                />
              );
            })}
          </section>
        )}

        {questions.length > 0 ? (
          <div className="sticky bottom-5 z-20 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] px-6 py-4 text-sm font-black text-white shadow-2xl shadow-sky-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function QuestionCard({ question, index, questionId, value, onChange }) {
  const questionText =
    question.question_text ||
    question.text ||
    question.question ||
    "Question text unavailable";

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/60 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-sky-700">
            Question {index + 1}
          </p>

          <h2 className="mt-2 text-base font-bold leading-7 text-slate-950">
            {questionText}
          </h2>
        </div>

        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-100">
          {question.marks || 1} marks
        </span>
      </div>

      {question.question_type === "mcq" &&
      Array.isArray(question.options) &&
      question.options.length > 0 ? (
        <div className="mt-5 space-y-3">
          {question.options.map((option, optionIndex) => {
            const selected = value === option;

            return (
              <label
                key={`${questionId}-${optionIndex}`}
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition",
                  selected
                    ? "border-sky-300 bg-sky-50 text-sky-900 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/60",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name={`question-${questionId}`}
                  value={option}
                  checked={selected}
                  onChange={(event) => onChange(questionId, event.target.value)}
                  className="h-4 w-4 accent-sky-600"
                />
                <span className="text-sm font-bold">{option}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(event) => onChange(questionId, event.target.value)}
          rows={5}
          placeholder="Write your answer here..."
          className="mt-5 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
      )}
    </article>
  );
}

function InfoBadge({ icon: Icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black text-white backdrop-blur">
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

export default TakeTest;
