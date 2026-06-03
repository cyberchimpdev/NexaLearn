import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  ClipboardCheck,
  Flame,
  Sparkles,
  Target,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

function StudentDashboard() {
  const stats = [
    {
      label: "Available Tests",
      value: "12",
      icon: BookOpen,
      tone: "bg-blue-50 text-blue-600",
    },
    {
      label: "Completed Attempts",
      value: "8",
      icon: ClipboardCheck,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Weak Concepts",
      value: "5",
      icon: Target,
      tone: "bg-red-50 text-red-600",
    },
    {
      label: "Daily Streak",
      value: "3",
      icon: Flame,
      tone: "bg-orange-50 text-orange-600",
    },
  ];

  const quickActions = [
    {
      title: "Take a Test",
      description: "Attempt diagnostic tests assigned by your teacher.",
      href: "/student/tests",
      icon: BookOpen,
    },
    {
      title: "View Reports",
      description: "Review your mistakes, weak topics, and recovery tasks.",
      href: "/student/reports",
      icon: BarChart3,
    },
    {
      title: "Ask AI Tutor",
      description: "Get personalized explanations for any doubt.",
      href: "/student/ai",
      icon: Brain,
    },
  ];

  return (
    <DashboardLayout role="student">
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-900 p-6 text-white shadow-sm sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  Student Learning Dashboard
                </div>

                <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-4xl">
                  Continue your personalized learning recovery.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-50 sm:text-base">
                  Take tests, review mistakes, understand weak concepts, and use
                  AI explanations based on your learning profile.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/student/tests"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
                  >
                    Start Test
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/student/reports"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    View Reports
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600">
                    <Brain className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm text-indigo-100">AI Recovery Mode</p>
                    <p className="text-lg font-bold">Active</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-indigo-50">
                  NexaLearn turns your wrong answers into clear revision tasks,
                  personalized explanations, and practice direction.
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
            {quickActions.map((item) => {
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
                <Target className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Today’s recovery focus
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Review your latest mistakes, identify the weak concept, and
                  ask the AI tutor for one simple explanation plus one practice
                  task.
                </p>

                <Link
                  to="/student/reports"
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  Review Mistakes
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

export default StudentDashboard;
