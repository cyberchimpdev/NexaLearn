import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ClipboardCheck } from "lucide-react";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { getTests } from "../../services/testService";

export function StudentTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTests() {
    setLoading(true);
    setError("");

    try {
      const data = await getTests();
      setTests(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to load tests. Check backend and login.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTests();
  }, []);

  return (
    <DashboardLayout title="Available Tests">
      <section className="glass-card p-6">
        <div className="mb-6">
          <span className="badge">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Diagnostic tests
          </span>
          <h2 className="mt-4 text-2xl font-black text-slate-950">
            Choose a test to find your learning gaps.
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            After submission, NexaLearn AI will detect your weak concept and
            generate a recovery card.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-slate-500">
            Loading tests...
          </div>
        ) : tests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-lg font-black text-slate-950">
              No tests available
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Ask your teacher to publish a diagnostic test.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {tests.map((test) => (
              <article
                key={test.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="badge">{test.class_level}</span>
                    <h3 className="mt-3 text-lg font-black text-slate-950">
                      {test.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {test.subject} • {test.topic}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-600">
                    {test.difficulty}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {test.description || "No description provided."}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MiniStat label="Questions" value={test.question_count} />
                  <MiniStat label="Marks" value={test.total_marks} />
                </div>

                <Link
                  to={`/student/tests/${test.id}`}
                  className="btn-primary mt-5 w-full"
                >
                  Start Test
                </Link>
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
      <p className="mt-1 text-xl font-black text-slate-950">{value ?? 0}</p>
    </div>
  );
}
