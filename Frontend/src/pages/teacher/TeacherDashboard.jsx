import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  ClipboardList,
  GraduationCap,
  PlusCircle,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

function TeacherDashboard() {
  const stats = [
    {
      label: "Created Tests",
      value: "8",
      icon: ClipboardList,
      tone: "bg-blue-50 text-blue-600",
    },
    {
      label: "Students",
      value: "42",
      icon: Users,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Weak Concepts",
      value: "12",
      icon: Target,
      tone: "bg-red-50 text-red-600",
    },
    {
      label: "AI Reports",
      value: "24",
      icon: Brain,
      tone: "bg-indigo-50 text-indigo-600",
    },
  ];

  const actions = [
    {
      title: "Create Diagnostic Test",
      description:
        "Build class-wise tests with questions, marks, answers, and topic information.",
      href: "/teacher/tests/create",
      icon: PlusCircle,
    },
    {
      title: "View Test Reports",
      description:
        "Open reports after students submit tests and review weak concept patterns.",
      href: "/teacher",
      icon: BarChart3,
    },
    {
      title: "Remedial Groups",
      description:
        "Group students by similar mistake patterns and reteach faster.",
      href: "/teacher",
      icon: Users,
    },
  ];

  return (
    <DashboardLayout role="teacher">
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-900 p-6 text-white shadow-sm sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  Teacher Dashboard
                </div>

                <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-4xl">
                  Detect learning gaps and guide students faster.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-50 sm:text-base">
                  Create diagnostic tests, analyze student mistakes, identify
                  weak concepts, and use AI-powered reports to plan targeted
                  remedial teaching.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/teacher/tests/create"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
                  >
                    Create Test
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/teacher"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    View Reports
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600">
                    <GraduationCap className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm text-indigo-100">Teacher Control</p>
                    <p className="text-lg font-bold">Human-centered AI</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-indigo-50">
                  NexaLearn supports teachers by reducing manual diagnosis work.
                  Teachers still control tests, interpretation, and
                  intervention.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.label}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-slate-950">
                        {item.value}
                      </p>
                    </div>

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="grid gap-5 lg:grid-cols-3">
            {actions.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  to={item.href}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h2 className="mt-5 text-lg font-bold text-slate-950">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600">
                    Open
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <BookOpen className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Recommended workflow
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Create a diagnostic test, let students submit answers, then
                  review AI-generated weak concept reports and remedial groups.
                </p>

                <Link
                  to="/teacher/tests/create"
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  Create First Test
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </DashboardLayout>
  );
}

export default TeacherDashboard;
