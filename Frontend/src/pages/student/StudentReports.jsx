import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RefreshCw,
  Target,
  Trophy,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getStudentReports } from "../../services/reportService";

const defaultData = {
  summary: {
    total_attempts: 0,
    average_score: 0,
    weak_concepts_count: 0,
    completed_tests: 0,
  },
  attempts: [],
  weak_concepts: [],
  mistake_patterns: [],
  recovery_tasks: [],
};

export default function StudentReports() {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    const source = data?.summary || data?.stats || {};

    return {
      total_attempts:
        source.total_attempts ||
        source.totalAttempts ||
        data?.attempts?.length ||
        data?.reports?.length ||
        0,
      average_score:
        source.average_score || source.averageScore || source.avg_score || 0,
      weak_concepts_count:
        source.weak_concepts_count ||
        source.weakConceptsCount ||
        data?.weak_concepts?.length ||
        0,
      completed_tests: source.completed_tests || source.completedTests || 0,
    };
  }, [data]);

  const attempts = Array.isArray(data?.attempts)
    ? data.attempts
    : Array.isArray(data?.reports)
      ? data.reports
      : [];

  const weakConcepts = Array.isArray(data?.weak_concepts)
    ? data.weak_concepts
    : [];

  const mistakePatterns = Array.isArray(data?.mistake_patterns)
    ? data.mistake_patterns
    : [];

  const recoveryTasks = Array.isArray(data?.recovery_tasks)
    ? data.recovery_tasks
    : [];

  async function loadReports() {
    setLoading(true);
    setError("");

    try {
      const response = await getStudentReports();

      setData({
        ...defaultData,
        ...response,
        summary: {
          ...defaultData.summary,
          ...(response?.summary || response?.stats || {}),
        },
        attempts: response?.attempts || response?.reports || [],
        weak_concepts: response?.weak_concepts || [],
        mistake_patterns: response?.mistake_patterns || [],
        recovery_tasks: response?.recovery_tasks || [],
      });
    } catch (err) {
      console.error("Report loading failed:", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });

      const status = err?.response?.status;

      if (status === 401) {
        setError("Login token expired. Log out and log in again.");
      } else if (status === 404) {
        setError(
          "Reports route not found. Check backend route: /api/reports/student/",
        );
      } else if (status === 500) {
        setError(
          "Backend reports view crashed. Check Django terminal traceback.",
        );
      } else {
        setError(
          "Could not load reports. Check backend route: /api/reports/student/",
        );
      }

      setData(defaultData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <DashboardLayout role="student">
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="rounded-[2rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-950 p-8 text-white shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black">
                  <BarChart3 className="h-4 w-4" />
                  Student Reports
                </div>

                <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
                  Track your mistakes and recovery progress.
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-50">
                  Review your test attempts, weak concepts, mistake patterns,
                  and AI-powered recovery tasks.
                </p>
              </div>

              <button
                type="button"
                onClick={loadReports}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </button>
            </div>
          </section>

          {error ? (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3 text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-black">Report loading failed</p>
                  <p className="mt-1 text-sm font-medium">{error}</p>
                </div>
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Attempts"
              value={summary.total_attempts}
              icon={<ClipboardList className="h-5 w-5" />}
              tone="blue"
            />

            <StatCard
              label="Average Score"
              value={`${summary.average_score}%`}
              icon={<Trophy className="h-5 w-5" />}
              tone="emerald"
            />

            <StatCard
              label="Weak Concepts"
              value={summary.weak_concepts_count}
              icon={<Target className="h-5 w-5" />}
              tone="red"
            />

            <StatCard
              label="Completed Tests"
              value={summary.completed_tests}
              icon={<CheckCircle2 className="h-5 w-5" />}
              tone="indigo"
            />
          </section>

          {loading ? (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
              <p className="mt-4 text-sm font-bold text-slate-600">
                Loading reports...
              </p>
            </section>
          ) : attempts.length === 0 ? (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
              <BarChart3 className="mx-auto h-12 w-12 text-slate-300" />
              <h2 className="mt-5 text-xl font-black text-slate-950">
                No reports yet
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Complete a diagnostic test first. Your attempt report and
                mistake analysis will appear here.
              </p>
            </section>
          ) : (
            <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {attempts.map((attempt) => (
                  <AttemptCard key={attempt.id} attempt={attempt} />
                ))}
              </div>

              <aside className="space-y-4">
                <Panel title="Weak Concepts">
                  {weakConcepts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {weakConcepts.map((concept) => (
                        <span
                          key={concept}
                          className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <EmptySmall text="No weak concepts detected yet." />
                  )}
                </Panel>

                <Panel title="Mistake Patterns">
                  {mistakePatterns.length > 0 ? (
                    <div className="space-y-3">
                      {mistakePatterns.map((item) => (
                        <div
                          key={item.type}
                          className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                        >
                          <span className="text-sm font-bold text-slate-700">
                            {item.type}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-900">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptySmall text="No mistake patterns yet." />
                  )}
                </Panel>

                <Panel title="Recovery Tasks">
                  {recoveryTasks.length > 0 ? (
                    <div className="space-y-3">
                      {recoveryTasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <p className="text-sm font-black text-slate-950">
                            {task.concept}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {task.task}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptySmall text="No recovery tasks yet." />
                  )}
                </Panel>
              </aside>
            </section>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            tones[tone] || tones.blue
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function AttemptCard({ attempt }) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-950">
            {attempt.test_title || attempt.title || "Practice Test"}
          </h3>

          <p className="mt-2 text-sm font-bold text-slate-500">
            {attempt.subject || "General"} • {attempt.topic || "General"}
          </p>

          {attempt.created_at ? (
            <p className="mt-2 text-xs font-semibold text-slate-400">
              {new Date(attempt.created_at).toLocaleString()}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl bg-slate-50 px-5 py-4 text-center">
          <p className="text-xs font-bold text-slate-500">Score</p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {attempt.percentage || 0}%
          </p>
        </div>
      </div>

      {Array.isArray(attempt.mistakes) && attempt.mistakes.length > 0 ? (
        <div className="mt-5 space-y-3">
          {attempt.mistakes.map((mistake) => (
            <div
              key={mistake.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-sm font-black text-slate-950">
                {mistake.weak_concept}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-red-500">
                {mistake.mistake_type}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {mistake.explanation || "No explanation saved."}
              </p>
              <p className="mt-2 text-sm font-bold text-indigo-700">
                {mistake.revision_task}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-black text-slate-950">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptySmall({ text }) {
  return <p className="text-sm font-medium text-slate-500">{text}</p>;
}
