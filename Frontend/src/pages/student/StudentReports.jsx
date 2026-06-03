import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RefreshCcw,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

function StudentReports() {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({
    total_attempts: 0,
    average_score: 0,
    weak_concepts: 0,
    completed_tests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const normalizeReports = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.reports)) return data.reports;
    if (Array.isArray(data?.attempts)) return data.attempts;
    return [];
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reports/student/");

      const normalized = normalizeReports(response.data);
      setReports(normalized);

      const scores = normalized
        .map((item) => Number(item.score || item.percentage || item.total_score || 0))
        .filter((score) => !Number.isNaN(score));

      const averageScore =
        scores.length > 0
          ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
          : 0;

      const weakConceptCount = normalized.reduce((total, item) => {
        const concepts =
          item.weak_concepts ||
          item.weak_topics ||
          item.mistakes ||
          item.mistake_summary ||
          [];

        if (Array.isArray(concepts)) return total + concepts.length;
        return total;
      }, 0);

      setSummary({
        total_attempts: normalized.length,
        average_score: averageScore,
        weak_concepts: weakConceptCount,
        completed_tests: normalized.length,
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Could not load reports. Check backend route: /api/reports/student/"
      );
      setReports([]);
      setSummary({
        total_attempts: 0,
        average_score: 0,
        weak_concepts: 0,
        completed_tests: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getAttemptId = (report) => {
    return report.id || report.attempt_id || report.attempt?.id || report.pk;
  };

  const getTitle = (report) => {
    return (
      report.test?.title ||
      report.test_title ||
      report.title ||
      report.subject ||
      "Diagnostic Test"
    );
  };

  const getSubject = (report) => {
    return report.test?.subject || report.subject || "General";
  };

  const getScore = (report) => {
    return Number(report.score || report.percentage || report.total_score || 0);
  };

  const getDate = (report) => {
    const rawDate =
      report.created_at ||
      report.submitted_at ||
      report.completed_at ||
      report.date;

    if (!rawDate) return "No date";

    try {
      return new Date(rawDate).toLocaleDateString();
    } catch {
      return "No date";
    }
  };

  const getMistakeCount = (report) => {
    if (typeof report.mistake_count === "number") return report.mistake_count;
    if (Array.isArray(report.mistakes)) return report.mistakes.length;
    if (Array.isArray(report.weak_concepts)) return report.weak_concepts.length;
    return 0;
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-700">
              Loading reports...
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
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-900 p-6 text-white shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Student Reports
                </div>

                <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-4xl">
                  Track your mistakes and recovery progress.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-50 sm:text-base">
                  Review your test attempts, weak concepts, mistake patterns,
                  and AI-powered recovery tasks.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchReports}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
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
              value={summary.total_attempts}
              icon={ClipboardList}
              tone="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              label="Average Score"
              value={`${summary.average_score}%`}
              icon={Trophy}
              tone="bg-emerald-50 text-emerald-600"
            />

            <SummaryCard
              label="Weak Concepts"
              value={summary.weak_concepts}
              icon={Target}
              tone="bg-red-50 text-red-600"
            />

            <SummaryCard
              label="Completed Tests"
              value={summary.completed_tests}
              icon={CheckCircle2}
              tone="bg-indigo-50 text-indigo-600"
            />
          </section>

          {reports.length === 0 ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <BarChart3 className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-950">
                No reports yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Complete a diagnostic test first. Your attempt report and
                mistake analysis will appear here.
              </p>

              <Link
                to="/student/tests"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Go to Tests
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          ) : (
            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <h2 className="text-lg font-bold text-slate-950">
                  Attempt History
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Click “Review Mistakes” to view detailed AI recovery guidance.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {reports.map((report, index) => {
                  const attemptId = getAttemptId(report);
                  const score = getScore(report);
                  const mistakeCount = getMistakeCount(report);

                  return (
                    <article
                      key={attemptId || index}
                      className="grid gap-4 p-5 transition hover:bg-slate-50 sm:p-6 lg:grid-cols-[1fr_160px_170px]"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                            score >= 70
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {score >= 70 ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : (
                            <XCircle className="h-6 w-6" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-950">
                            {getTitle(report)}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {getSubject(report)} • {getDate(report)}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {mistakeCount} mistakes
                            </span>

                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                              AI Recovery Available
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center lg:justify-center">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Score
                          </p>
                          <p className="mt-1 text-2xl font-bold text-slate-950">
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
                            Review Mistakes
                            <Brain className="h-4 w-4" />
                          </Link>
                        ) : (
                          <span className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500">
                            No attempt ID
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
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

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </article>
  );
}

export default StudentReports;
