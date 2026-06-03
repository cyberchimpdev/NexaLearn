import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Loader2,
  Target,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getAttemptDetail,
  getAttemptMistakes,
} from "../../services/attemptService";
import { AIPlaygroundInline } from "../../components/student/AIPlaygroundInline";

function AttemptMistakes() {
  const { attemptId } = useParams();

  const [attempt, setAttempt] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const [selectedMistake, setSelectedMistake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAttemptMistakes();
  }, [attemptId]);

  const fetchAttemptMistakes = async () => {
    try {
      setLoading(true);
      setError("");

      const [attemptData, mistakesData] = await Promise.allSettled([
        getAttemptDetail(attemptId),
        getAttemptMistakes(attemptId),
      ]);

      if (attemptData.status === "fulfilled") {
        setAttempt(attemptData.value);
      }

      if (mistakesData.status === "fulfilled") {
        const result = mistakesData.value;

        const normalizedMistakes =
          result?.mistakes || result?.results || result?.data || result || [];

        setMistakes(
          Array.isArray(normalizedMistakes) ? normalizedMistakes : [],
        );
        setSelectedMistake(
          Array.isArray(normalizedMistakes) && normalizedMistakes.length > 0
            ? normalizedMistakes[0]
            : null,
        );
      } else {
        setMistakes([]);
      }
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Unable to load attempt mistakes.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getScore = () => {
    return (
      attempt?.score ||
      attempt?.percentage ||
      attempt?.total_score ||
      attempt?.marks_obtained ||
      0
    );
  };

  const getSubject = () => {
    return (
      attempt?.test?.subject ||
      attempt?.subject ||
      selectedMistake?.subject ||
      "General"
    );
  };

  const getTopic = () => {
    return (
      selectedMistake?.topic ||
      selectedMistake?.weak_concept ||
      attempt?.test?.topic ||
      attempt?.topic ||
      "General"
    );
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-700">
              Loading mistake analysis...
            </p>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                to="/student/reports"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to reports
              </Link>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Attempt Mistake Review
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Review your wrong answers, weak concepts, and AI-powered
                recovery explanation.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Attempt Score
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {getScore()}%
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Could not load mistake data</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          <section className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Mistakes
                  </p>
                  <p className="text-2xl font-bold text-slate-950">
                    {mistakes.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Subject
                  </p>
                  <p className="text-lg font-bold text-slate-950">
                    {getSubject()}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Recovery
                  </p>
                  <p className="text-lg font-bold text-slate-950">AI Guided</p>
                </div>
              </div>
            </div>
          </section>

          {mistakes.length === 0 ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-950">
                No mistakes found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Great work. This attempt has no recorded mistakes, or mistake
                data has not been generated yet.
              </p>
            </section>
          ) : (
            <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
              <aside className="space-y-3">
                {mistakes.map((mistake, index) => {
                  const isActive = selectedMistake === mistake;

                  return (
                    <button
                      key={mistake.id || index}
                      type="button"
                      onClick={() => setSelectedMistake(mistake)}
                      className={`w-full rounded-3xl border p-5 text-left transition ${
                        isActive
                          ? "border-indigo-300 bg-indigo-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-950">
                            Question {index + 1}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                            {mistake.question_text ||
                              mistake.question ||
                              "Question text unavailable"}
                          </p>
                        </div>

                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                          Wrong
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {mistake.mistake_type || "Mistake"}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {mistake.weak_concept || mistake.topic || "Concept"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </aside>

              <div className="space-y-6">
                {selectedMistake && (
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                        <Brain className="h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-slate-950">
                          Mistake Details
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Understand exactly what went wrong and how to recover.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Question
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-800">
                          {selectedMistake.question_text ||
                            selectedMistake.question ||
                            "Question unavailable"}
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-red-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                            Your Answer
                          </p>
                          <p className="mt-2 text-sm leading-6 text-red-900">
                            {selectedMistake.student_answer ||
                              selectedMistake.answer ||
                              "Not answered"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-emerald-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                            Correct Answer
                          </p>
                          <p className="mt-2 text-sm leading-6 text-emerald-900">
                            {selectedMistake.correct_answer ||
                              selectedMistake.expected_answer ||
                              "Unavailable"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-indigo-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                          Weak Concept
                        </p>
                        <p className="mt-2 text-sm leading-6 text-indigo-950">
                          {selectedMistake.weak_concept ||
                            selectedMistake.topic ||
                            "Concept not detected"}
                        </p>
                      </div>

                      {selectedMistake.explanation && (
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            AI Explanation
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                            {selectedMistake.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                <AIPlaygroundInline
                  mistake={selectedMistake}
                  subject={getSubject()}
                  topic={getTopic()}
                  learningProfile={attempt?.learning_profile || null}
                />
              </div>
            </section>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}

export default AttemptMistakes;
