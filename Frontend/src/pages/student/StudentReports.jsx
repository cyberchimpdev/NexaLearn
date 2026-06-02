import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, BookOpenCheck } from "lucide-react";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { getStudentReport } from "../../services/reportService";

export function StudentReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports() {
    setLoading(true);
    setError("");

    try {
      const data = await getStudentReport();
      setReports(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to load reports. Check backend and login.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <DashboardLayout title="My Reports">
      <section className="glass-card p-6">
        <div className="mb-6">
          <span className="badge">
            <BarChart3 className="mr-2 h-4 w-4" />
            Learning history
          </span>
          <h2 className="mt-4 text-2xl font-black text-slate-950">
            Your completed diagnostic tests.
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Track your learning recovery history.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-slate-500">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <BookOpenCheck className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-lg font-black text-slate-950">
              No reports yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Complete a test to generate your first report.
            </p>
            <Link to="/student/tests" className="btn-primary mt-5">
              View Tests
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <article
                key={report.attempt_id}
                className="rounded-3xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <span className="badge">{report.class_level}</span>
                    <h3 className="mt-3 text-lg font-black text-slate-950">
                      {report.test_title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {report.subject} • {report.topic}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:min-w-72">
                    <MiniStat
                      label="Score"
                      value={`${report.total_score}/${report.total_marks}`}
                    />
                    <MiniStat label="Percent" value={`${report.percentage}%`} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}
