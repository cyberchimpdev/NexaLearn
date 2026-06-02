import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  FileText,
  PlusCircle,
  UsersRound,
} from "lucide-react";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { getTeacherDashboardSummary } from "../../services/reportService";
import { getTests } from "../../services/testService";

export function TeacherDashboard() {
  const [tests, setTests] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [testsData, summaryData] = await Promise.all([
        getTests(),
        getTeacherDashboardSummary(),
      ]);

      setTests(testsData);
      setSummary(summaryData);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to load dashboard. Check backend and login token.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={FileText}
            label="Total Tests"
            value={summary?.total_tests ?? tests.length}
          />
          <StatCard
            icon={UsersRound}
            label="Total Attempts"
            value={summary?.total_attempts ?? 0}
          />
          <StatCard icon={BarChart3} label="AI Reports" value="Live" />
        </div>

        <section className="glass-card p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Your Diagnostic Tests
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Create tests and review AI-generated learning gap reports.
              </p>
            </div>

            <Link to="/teacher/tests/create" className="btn-primary">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Test
            </Link>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">
              Loading tests...
            </div>
          ) : tests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-4 text-lg font-black text-slate-950">
                No tests created yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Create your first diagnostic test for NexaLearn AI analysis.
              </p>
              <Link to="/teacher/tests/create" className="btn-primary mt-5">
                Create First Test
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {tests.map((test) => (
                <article
                  key={test.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-soft"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <span className="badge">{test.class_level}</span>
                      <h3 className="mt-3 text-lg font-black text-slate-950">
                        {test.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {test.subject} • {test.topic}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                      {test.difficulty}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    {test.description || "No description provided."}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <MiniStat label="Questions" value={test.question_count} />
                    <MiniStat label="Marks" value={test.total_marks} />
                  </div>

                  <Link
                    to={`/teacher/tests/${test.id}/report`}
                    className="btn-primary mt-5 w-full py-2"
                  >
                    View Report
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-950">{value ?? 0}</p>
    </div>
  );
}
