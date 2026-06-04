import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Brain,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RefreshCcw,
  Target,
  Users,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

function TestReport() {
  const { testId } = useParams();

  const [report, setReport] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [weakConcepts, setWeakConcepts] = useState([]);
  const [remedialGroups, setRemedialGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReport();
  }, [testId]);

  function normalizeArray(value) {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.results)) return value.results;
    if (Array.isArray(value?.data)) return value.data;
    return [];
  }

  async function fetchReport() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/reports/tests/${testId}/`);
      const data = response.data || {};

      setReport(data);
      setAttempts(
        normalizeArray(data.attempts || data.student_attempts || data.results),
      );
      setWeakConcepts(
        normalizeArray(data.weak_concepts || data.weak_topics || data.concepts),
      );
      setRemedialGroups(
        normalizeArray(
          data.remedial_groups || data.groups || data.recovery_groups,
        ),
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Could not load test report. Check backend route: /api/reports/tests/:testId/",
      );
      setReport(null);
      setAttempts([]);
      setWeakConcepts([]);
      setRemedialGroups([]);
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    const scores = attempts
      .map((attempt) =>
        Number(attempt.score || attempt.percentage || attempt.total_score || 0),
      )
      .filter((score) => !Number.isNaN(score));

    const averageScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((total, score) => total + score, 0) / scores.length,
          )
        : Number(report?.average_score || 0);

    const passedCount = scores.filter((score) => score >= 60).length;
    const failedCount = Math.max(scores.length - passedCount, 0);

    return {
      totalAttempts: attempts.length || Number(report?.total_attempts || 0),
      averageScore,
      passedCount,
      failedCount,
      weakConceptCount:
        weakConcepts.length || Number(report?.weak_concept_count || 0),
    };
  }, [attempts, weakConcepts, report]);

  function getTitle() {
    return (
      report?.test?.title ||
      report?.test_title ||
      report?.title ||
      "Test Report"
    );
  }

  function getSubject() {
    return report?.test?.subject || report?.subject || "General";
  }

  function getGrade() {
    return report?.test?.grade_level || report?.grade_level || "General";
  }

  function getAttemptScore(attempt) {
    return Number(
      attempt.score || attempt.percentage || attempt.total_score || 0,
    );
  }

  function getStudentName(attempt) {
    return (
      attempt.student?.full_name ||
      attempt.student?.username ||
      attempt.user?.full_name ||
      attempt.user?.username ||
      attempt.student_name ||
      "Student"
    );
  }

  function getAttemptId(attempt) {
    return attempt.id || attempt.attempt_id || attempt.pk;
  }

  function getMistakeCount(attempt) {
    if (typeof attempt.mistake_count === "number") return attempt.mistake_count;
    if (Array.isArray(attempt.mistakes)) return attempt.mistakes.length;
    if (Array.isArray(attempt.weak_concepts)) {
      return attempt.weak_concepts.length;
    }

    return 0;
  }

  if (loading) {
    return (
      <DashboardLayout title="Test Report">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
            <p className="text-sm font-semibold text-slate-700">
              Loading test report...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Test Report">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_52%,#22c55e_100%)] p-6 text-white shadow-xl shadow-sky-500/15 sm:p-8">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                to="/teacher"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to teacher dashboard
              </Link>

              <h1 className="mt-6 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                {getTitle()}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-sky-50 sm:text-base">
                Teacher report for {getSubject()} • {getGrade()}. Review student
                performance, weak concepts, and remedial group recommendations.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchReport}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-sky-700 shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-sky-50"
            >
              <RefreshCcw className="h-4 w-4" />
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

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Attempts"
            value={summary.totalAttempts}
            icon={ClipboardList}
            tone="sky"
          />

          <SummaryCard
            label="Average Score"
            value={`${summary.averageScore}%`}
            icon={BarChart3}
            tone="emerald"
          />

          <SummaryCard
            label="Weak Concepts"
            value={summary.weakConceptCount}
            icon={Target}
            tone="red"
          />

          <SummaryCard
            label="Passed Students"
            value={summary.passedCount}
            icon={CheckCircle2}
            tone="blue"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <h2 className="text-xl font-black text-slate-950">
                Student Attempts
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Individual student performance and mistake counts.
              </p>
            </div>

            {attempts.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                  <Users className="h-8 w-8" />
                </div>

                <h3 className="mt-5 text-lg font-black text-slate-950">
                  No attempts yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Student submissions will appear here after they take this
                  test.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {attempts.map((attempt, index) => {
                  const score = getAttemptScore(attempt);
                  const attemptId = getAttemptId(attempt);

                  return (
                    <article
                      key={attemptId || index}
                      className="grid gap-4 p-5 transition duration-300 hover:bg-sky-50/40 sm:p-6 lg:grid-cols-[1fr_110px_150px]"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${
                            score >= 60
                              ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                              : "bg-red-50 text-red-600 ring-red-100"
                          }`}
                        >
                          {score >= 60 ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-black text-slate-950">
                            {getStudentName(attempt)}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-slate-500">
                            {getMistakeCount(attempt)} mistakes detected
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                            Score
                          </p>
                          <p className="mt-1 text-xl font-black text-slate-950">
                            {score}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center lg:justify-end">
                        {attemptId ? (
                          <Link
                            to={`/student/reports/${attemptId}/mistakes`}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] px-4 py-3 text-sm font-black text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5"
                          >
                            Review
                            <Brain className="h-4 w-4" />
                          </Link>
                        ) : (
                          <span className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-500">
                            No ID
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <SidePanel
              title="Weak Concepts"
              description="Topics students struggled with most."
              icon={Target}
              tone="red"
            >
              <div className="space-y-3">
                {weakConcepts.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    No weak concepts detected yet.
                  </p>
                ) : (
                  weakConcepts.map((concept, index) => (
                    <InfoBlock
                      key={concept.id || concept.name || index}
                      title={
                        concept.name ||
                        concept.concept ||
                        concept.topic ||
                        `Weak Concept ${index + 1}`
                      }
                      text={
                        concept.description ||
                        concept.reason ||
                        `${concept.count || concept.students || 0} students affected`
                      }
                    />
                  ))
                )}
              </div>
            </SidePanel>

            <SidePanel
              title="Remedial Groups"
              description="Suggested groups for focused reteaching."
              icon={Users}
              tone="sky"
            >
              <div className="space-y-3">
                {remedialGroups.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    No remedial groups generated yet.
                  </p>
                ) : (
                  remedialGroups.map((group, index) => (
                    <InfoBlock
                      key={group.id || group.name || index}
                      title={group.name || group.title || `Group ${index + 1}`}
                      text={
                        group.description ||
                        group.focus ||
                        group.weak_concept ||
                        "Targeted reteaching group"
                      }
                    />
                  ))
                )}
              </div>
            </SidePanel>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  const tones = {
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-red-50 text-red-700 ring-red-100",
  };

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/60">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${
            tones[tone] || tones.sky
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </article>
  );
}

function SidePanel({ title, description, icon: Icon, tone, children }) {
  const tones = {
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    red: "bg-red-50 text-red-700 ring-red-100",
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/60 sm:p-6">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${
            tones[tone] || tones.sky
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoBlock({ title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-sky-50/50">
      <p className="font-black text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

export default TestReport;
