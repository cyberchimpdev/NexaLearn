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

  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.results)) return value.results;
    if (Array.isArray(value?.data)) return value.data;
    return [];
  };

  const fetchReport = async () => {
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
  };

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

  const getTitle = () => {
    return (
      report?.test?.title ||
      report?.test_title ||
      report?.title ||
      "Test Report"
    );
  };

  const getSubject = () => {
    return report?.test?.subject || report?.subject || "General";
  };

  const getGrade = () => {
    return report?.test?.grade_level || report?.grade_level || "General";
  };

  const getAttemptScore = (attempt) => {
    return Number(
      attempt.score || attempt.percentage || attempt.total_score || 0,
    );
  };

  const getStudentName = (attempt) => {
    return (
      attempt.student?.full_name ||
      attempt.student?.username ||
      attempt.user?.full_name ||
      attempt.user?.username ||
      attempt.student_name ||
      "Student"
    );
  };

  const getAttemptId = (attempt) => {
    return attempt.id || attempt.attempt_id || attempt.pk;
  };

  const getMistakeCount = (attempt) => {
    if (typeof attempt.mistake_count === "number") return attempt.mistake_count;
    if (Array.isArray(attempt.mistakes)) return attempt.mistakes.length;
    if (Array.isArray(attempt.weak_concepts))
      return attempt.weak_concepts.length;
    return 0;
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-700">
              Loading test report...
            </p>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <Link
              to="/teacher"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to teacher dashboard
            </Link>

            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {getTitle()}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Teacher report for {getSubject()} • {getGrade()}. Review
                  student performance, weak concepts, and remedial group
                  recommendations.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchReport}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Report loading failed</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Attempts"
              value={summary.totalAttempts}
              icon={ClipboardList}
              tone="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              label="Average Score"
              value={`${summary.averageScore}%`}
              icon={BarChart3}
              tone="bg-emerald-50 text-emerald-600"
            />

            <SummaryCard
              label="Weak Concepts"
              value={summary.weakConceptCount}
              icon={Target}
              tone="bg-red-50 text-red-600"
            />

            <SummaryCard
              label="Passed Students"
              value={summary.passedCount}
              icon={CheckCircle2}
              tone="bg-indigo-50 text-indigo-600"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <h2 className="text-lg font-bold text-slate-950">
                  Student Attempts
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Individual student performance and mistake counts.
                </p>
              </div>

              {attempts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <Users className="h-7 w-7" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950">
                    No attempts yet
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
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
                        className="grid gap-4 p-5 transition hover:bg-slate-50 sm:p-6 lg:grid-cols-[1fr_110px_150px]"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                              score >= 60
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {score >= 60 ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <XCircle className="h-5 w-5" />
                            )}
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-950">
                              {getStudentName(attempt)}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {getMistakeCount(attempt)} mistakes detected
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Score
                            </p>
                            <p className="mt-1 text-xl font-bold text-slate-950">
                              {score}%
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center lg:justify-end">
                          {attemptId ? (
                            <Link
                              to={`/student/reports/${attemptId}/mistakes`}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                            >
                              Review
                              <Brain className="h-4 w-4" />
                            </Link>
                          ) : (
                            <span className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500">
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
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Target className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Weak Concepts
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Topics students struggled with most.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {weakConcepts.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                      No weak concepts detected yet.
                    </p>
                  ) : (
                    weakConcepts.map((concept, index) => (
                      <div
                        key={concept.id || concept.name || index}
                        className="rounded-2xl bg-slate-50 p-4"
                      >
                        <p className="font-bold text-slate-950">
                          {concept.name ||
                            concept.concept ||
                            concept.topic ||
                            `Weak Concept ${index + 1}`}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {concept.description ||
                            concept.reason ||
                            `${concept.count || concept.students || 0} students affected`}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Users className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Remedial Groups
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Suggested groups for focused reteaching.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {remedialGroups.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                      No remedial groups generated yet.
                    </p>
                  ) : (
                    remedialGroups.map((group, index) => (
                      <div
                        key={group.id || group.name || index}
                        className="rounded-2xl bg-slate-50 p-4"
                      >
                        <p className="font-bold text-slate-950">
                          {group.name || group.title || `Group ${index + 1}`}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {group.description ||
                            group.focus ||
                            group.weak_concept ||
                            "Targeted reteaching group"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
    </DashboardLayout>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </article>
  );
}

export default TestReport;
