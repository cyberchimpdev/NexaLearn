import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Brain,
  Clock,
  GraduationCap,
  Loader2,
  RefreshCcw,
  Search,
  Target,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

function StudentTests() {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, searchTerm, subjectFilter]);

  function normalizeTests(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.tests)) return data.tests;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  async function fetchTests() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tests/");
      const normalized = normalizeTests(response.data);

      setTests(normalized);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Could not load tests. Check backend route: /api/tests/",
      );
      setTests([]);
    } finally {
      setLoading(false);
    }
  }

  function filterTests() {
    let nextTests = [...tests];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();

      nextTests = nextTests.filter((test) => {
        const title = String(test.title || "").toLowerCase();
        const subject = String(test.subject || "").toLowerCase();
        const topic = String(test.topic || "").toLowerCase();
        const grade = String(test.grade_level || "").toLowerCase();

        return (
          title.includes(query) ||
          subject.includes(query) ||
          topic.includes(query) ||
          grade.includes(query)
        );
      });
    }

    if (subjectFilter !== "all") {
      nextTests = nextTests.filter(
        (test) => String(test.subject || "").toLowerCase() === subjectFilter,
      );
    }

    setFilteredTests(nextTests);
  }

  const subjects = Array.from(
    new Set(
      tests.map((test) => String(test.subject || "").trim()).filter(Boolean),
    ),
  );

  const getTestId = (test) => test.id || test.test_id || test.pk;

  const getQuestionCount = (test) => {
    if (Array.isArray(test.questions)) return test.questions.length;
    if (typeof test.question_count === "number") return test.question_count;
    if (typeof test.total_questions === "number") return test.total_questions;
    return 0;
  };

  const getDuration = (test) => {
    return test.duration_minutes || test.duration || 30;
  };

  const getDifficulty = (test) => {
    return test.difficulty || test.level || "Diagnostic";
  };

  if (loading) {
    return (
      <DashboardLayout title="Teacher Tests">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
            <p className="text-sm font-semibold text-slate-700">
              Loading tests...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Teacher Tests">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_52%,#22c55e_100%)] p-6 text-white shadow-xl shadow-sky-500/15 sm:p-8">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur">
                <BookOpen className="h-4 w-4" />
                Student Tests
              </div>

              <h1 className="mt-6 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                Take diagnostic tests and discover learning gaps.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-sky-50 sm:text-base">
                Complete teacher-created tests. NexaLearn will analyze your
                answers, detect weak concepts, and generate recovery tasks.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchTests}
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
                <p className="text-sm font-black">Could not load tests</p>
                <p className="mt-1 text-sm font-medium">{error}</p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, subject, topic, or class..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject.toLowerCase()}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </section>

        {filteredTests.length === 0 ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
              <BookOpen className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950">
              No tests found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              No diagnostic tests match your search or no tests have been
              created yet.
            </p>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTests.map((test, index) => {
              const testId = getTestId(test);

              return (
                <article
                  key={testId || index}
                  className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] text-white shadow-lg shadow-sky-200/70">
                      <Brain className="h-6 w-6" />
                    </div>

                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-100">
                      {getDifficulty(test)}
                    </span>
                  </div>

                  <h2 className="mt-5 text-lg font-black text-slate-950">
                    {test.title || "Untitled Test"}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {test.description ||
                      "Complete this diagnostic test to identify your weak concepts."}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <InfoPill
                      icon={GraduationCap}
                      label="Class"
                      value={test.grade_level || "General"}
                    />

                    <InfoPill
                      icon={Target}
                      label="Subject"
                      value={test.subject || "General"}
                    />

                    <InfoPill
                      icon={BookOpen}
                      label="Questions"
                      value={getQuestionCount(test)}
                    />

                    <InfoPill
                      icon={Clock}
                      label="Minutes"
                      value={getDuration(test)}
                    />
                  </div>

                  <div className="mt-5">
                    {testId ? (
                      <Link
                        to={`/student/tests/${testId}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5"
                      >
                        Take Test
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-400"
                      >
                        Missing Test ID
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-sky-200 hover:bg-sky-50/50">
      <div className="flex items-center gap-2 text-sky-700">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-black uppercase tracking-wide">{label}</p>
      </div>

      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

export default StudentTests;
