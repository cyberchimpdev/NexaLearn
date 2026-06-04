import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  GraduationCap,
  PlusCircle,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

const stats = [
  {
    label: "Created Tests",
    value: "6",
    icon: ClipboardList,
    tone: "sky",
  },
  {
    label: "Student Attempts",
    value: "42",
    icon: UsersRound,
    tone: "emerald",
  },
  {
    label: "Weak Concepts",
    value: "9",
    icon: Target,
    tone: "red",
  },
  {
    label: "Class Average",
    value: "72%",
    icon: BarChart3,
    tone: "blue",
  },
];

const quickActions = [
  {
    title: "Create Diagnostic Test",
    text: "Build class-wise tests with subject, topic, questions, marks, and answers.",
    to: "/teacher/tests/create",
    icon: PlusCircle,
  },
  {
    title: "Review Student Reports",
    text: "Analyze class performance, weak concepts, and student attempt patterns.",
    to: "/teacher/reports",
    icon: BarChart3,
  },
  {
    title: "Plan Remedial Groups",
    text: "Use weak concept patterns to group students for targeted teaching.",
    to: "/teacher",
    icon: UsersRound,
  },
];

function TeacherDashboard() {
  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_52%,#22c55e_100%)] p-6 text-white shadow-xl shadow-sky-500/15 sm:p-8">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Teacher Learning Dashboard
              </div>

              <h1 className="mt-6 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                Turn class test results into targeted teaching actions.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-sky-50 sm:text-base">
                Create diagnostic tests, monitor student attempts, identify weak
                concepts, and prepare remedial groups with less manual work.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/teacher/tests/create"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black text-sky-700 shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-sky-50"
                >
                  Create Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  to="/teacher/reports"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  View Reports
                </Link>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-700">
                  <GraduationCap className="h-7 w-7" />
                </div>

                <div>
                  <p className="text-sm font-bold text-sky-100">
                    Classroom Recovery
                  </p>
                  <h2 className="mt-1 text-xl font-black text-white">
                    Teacher-led
                  </h2>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-sky-50">
                NexaLearn helps teachers understand where students are stuck,
                not just how many marks they scored.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard key={item.label} item={item} />
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {quickActions.map((item) => (
            <ActionCard key={item.title} item={item} />
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Class Weak Concept Overview
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Concepts that need focused classroom revision.
                </p>
              </div>

              <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                <Target className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                { concept: "Electric Field Formula", students: 14 },
                { concept: "Grammar Transitions", students: 11 },
                { concept: "Linear Equation Setup", students: 8 },
              ].map((item, index) => (
                <div
                  key={item.concept}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      {item.concept}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {item.students} students need support
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-sky-700">
                    Group {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-emerald-50 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
                <BookOpenCheck className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-950">
                Teaching Focus
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Start with the most repeated weak concept, reteach it with one
                example, then assign a short recovery task.
              </p>

              <Link
                to="/teacher/tests/create"
                className="mt-5 inline-flex items-center text-sm font-black text-sky-700 transition hover:text-emerald-600"
              >
                Create next diagnostic
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ item }) {
  const Icon = item.icon;

  const tones = {
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
  };

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/60">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{item.label}</p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {item.value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${
            tones[item.tone]
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function ActionCard({ item }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/60"
    >
      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-emerald-500 p-3 text-white shadow-lg shadow-sky-200/70">
        <Icon className="h-6 w-6 transition group-hover:scale-110" />
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-950">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>

      <div className="mt-5 inline-flex items-center text-sm font-black text-sky-700 transition group-hover:text-emerald-600">
        Open
        <ArrowRight className="ml-2 h-4 w-4" />
      </div>
    </Link>
  );
}

export default TeacherDashboard;
