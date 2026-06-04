import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Target,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getAttemptDetail,
  getAttemptMistakes,
} from "../../services/attemptService";
import { AIPlaygroundInline } from "../../components/student/AIPlaygroundInline";
import {
  buildMistakeTutorContext,
  useTutorAI,
} from "../../context/TutorAIContext";

function AttemptMistakes() {
  const { attemptId } = useParams();
  const { openTutor } = useTutorAI();

  const [attempt, setAttempt] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const [selectedMistake, setSelectedMistake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAttemptMistakes();
  }, [attemptId]);

  async function fetchAttemptMistakes() {
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

        const safeMistakes = Array.isArray(normalizedMistakes)
          ? normalizedMistakes
          : [];

        setMistakes(safeMistakes);
        setSelectedMistake(safeMistakes.length > 0 ? safeMistakes[0] : null);
      } else {
        setMistakes([]);
        setSelectedMistake(null);
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
  }

  function getScore() {
    return (
      attempt?.score ||
      attempt?.percentage ||
      attempt?.total_score ||
      attempt?.marks_obtained ||
      0
    );
  }

  function getSubject() {
    return (
      attempt?.test?.subject ||
      attempt?.subject ||
      selectedMistake?.subject ||
      "General"
    );
  }

  function getTopic() {
    return (
      selectedMistake?.topic ||
      selectedMistake?.weak_concept ||
      attempt?.test?.topic ||
      attempt?.topic ||
      "General"
    );
  }

  function handleAskTutorAI(mistake) {
    openTutor(
      buildMistakeTutorContext({
        mistake,
        subject: getSubject(),
        topic: mistake?.weak_concept || mistake?.topic || getTopic(),
        learningProfile: attempt?.learning_profile || null,
      }),
      { initialMessage: "Explain my mistake step by step." },
    );
  }

  if (loading) {
    return (
      <DashboardLayout title="Mistake Review">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
            <p className="text-sm font-semibold text-slate-700">
              Loading mistake analysis...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mistake Review">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_52%,#22c55e_100%)] p-6 text-white shadow-xl shadow-sky-500/15 sm:p-8">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Link
                to="/student/reports"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to reports
              </Link>

              <h1 className="mt-6 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                Review your mistakes and recover weak concepts.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-sky-50 sm:text-base">
                Understand what went wrong, compare your answer with the correct
                answer, and ask Tutor AI for step-by-step recovery help.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-700">
                  <Target className="h-7 w-7" />
                </div>

                <div>
                  <p className="text-sm font-bold text-sky-100">
                    Attempt Score
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    {getScore()}%
                  </h2>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-sky-50">
                Subject: {getSubject()} • Topic: {getTopic()}
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-black">Could not load mistake data</p>
              <p className="mt-1 font-medium">{error}</p>
            </div>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Mistakes"
            value={mistakes.length}
            icon={XCircle}
            tone="red"
          />

          <StatCard
            label="Subject"
            value={getSubject()}
            icon={Target}
            tone="sky"
            compact
          />

          <StatCard
            label="Recovery"
            value="Tutor Guided"
            icon={CheckCircle2}
            tone="emerald"
            compact
          />
        </section>

        {mistakes.length === 0 ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950">
              No mistakes found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Great work. This attempt has no recorded mistakes, or mistake data
              has not been generated yet.
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
                    className={[
                      "w-full rounded-[2rem] border p-5 text-left transition duration-300",
                      isActive
                        ? "border-sky-300 bg-sky-50 shadow-lg shadow-sky-100/70"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-sky-200 hover:bg-slate-50 hover:shadow-xl hover:shadow-sky-100/50",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-950">
                          Question {index + 1}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                          {mistake.question_text ||
                            mistake.question ||
                            "Question text unavailable"}
                        </p>
                      </div>

                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">
                        Wrong
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAskTutorAI(mistake);
                      }}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 transition hover:bg-sky-100"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Ask Tutor AI
                    </button>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {mistake.mistake_type || "Mistake"}
                      </span>

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        {mistake.weak_concept || mistake.topic || "Concept"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </aside>

            <div className="space-y-6">
              {selectedMistake ? (
                <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/60 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] text-white shadow-lg shadow-sky-200/70">
                      <Brain className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-slate-950">
                        Mistake Details
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Understand exactly what went wrong and how to recover.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <InfoPanel
                      label="Question"
                      value={
                        selectedMistake.question_text ||
                        selectedMistake.question ||
                        "Question unavailable"
                      }
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoPanel
                        label="Your Answer"
                        value={
                          selectedMistake.student_answer ||
                          selectedMistake.answer ||
                          "Not answered"
                        }
                        tone="red"
                      />

                      <InfoPanel
                        label="Correct Answer"
                        value={
                          selectedMistake.correct_answer ||
                          selectedMistake.expected_answer ||
                          "Unavailable"
                        }
                        tone="emerald"
                      />
                    </div>

                    <InfoPanel
                      label="Weak Concept"
                      value={
                        selectedMistake.weak_concept ||
                        selectedMistake.topic ||
                        "Concept not detected"
                      }
                      tone="sky"
                    />

                    {selectedMistake.explanation ? (
                      <InfoPanel
                        label="Tutor Explanation"
                        value={selectedMistake.explanation}
                      />
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleAskTutorAI(selectedMistake)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] px-4 py-3 text-sm font-black text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Ask Tutor AI about this mistake
                    </button>
                  </div>
                </section>
              ) : null}

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
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon: Icon, tone = "sky", compact = false }) {
  const tones = {
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-red-50 text-red-700 ring-red-100",
  };

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/60">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${
            tones[tone] || tones.sky
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p
            className={[
              "mt-1 truncate font-black text-slate-950",
              compact ? "text-lg" : "text-3xl",
            ].join(" ")}
          >
            {value}
          </p>
        </div>
      </div>
    </article>
  );
}

function InfoPanel({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-800",
    red: "bg-red-50 text-red-900",
    emerald: "bg-emerald-50 text-emerald-900",
    sky: "bg-sky-50 text-sky-900",
  };

  const labelTones = {
    slate: "text-slate-500",
    red: "text-red-500",
    emerald: "text-emerald-600",
    sky: "text-sky-600",
  };

  return (
    <div className={`rounded-2xl p-4 ${tones[tone] || tones.slate}`}>
      <p
        className={`text-xs font-black uppercase tracking-wide ${
          labelTones[tone] || labelTones.slate
        }`}
      >
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
        {value || "Not available"}
      </p>
    </div>
  );
}

export default AttemptMistakes;
