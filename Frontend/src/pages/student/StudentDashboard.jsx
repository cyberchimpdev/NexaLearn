import { Link } from "react-router-dom";
import { BookOpenCheck, Sparkles, UserRoundCog } from "lucide-react";
import { DashboardLayout } from "../../layouts/DashboardLayout";

export function StudentDashboard() {
  return (
    <DashboardLayout title="Student Dashboard">
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="glass-card p-6 lg:col-span-2">
          <span className="badge">
            <Sparkles className="mr-2 h-4 w-4" />
            Personalized learning recovery
          </span>

          <h2 className="mt-5 text-3xl font-black text-slate-950">
            Find your weak topic. Learn it through your interest.
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Take a diagnostic test. NexaLearn AI will analyze your answer,
            detect your mistake type, and explain the weak concept through your
            selected interest like cricket, anime, gaming, or real life.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/student/tests" className="btn-primary">
              <BookOpenCheck className="mr-2 h-4 w-4" />
              View Tests
            </Link>

            <Link to="/student/profile" className="btn-secondary">
              <UserRoundCog className="mr-2 h-4 w-4" />
              Set Learning Profile
            </Link>
          </div>
        </section>

        <section className="glass-card p-6">
          <h3 className="text-xl font-black text-slate-950">Your AI Flow</h3>

          <div className="mt-5 space-y-4">
            {[
              "Choose your interest",
              "Attempt teacher test",
              "AI detects weak concept",
              "Get revision task",
            ].map((item, index) => (
              <div key={item} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                  {index + 1}
                </div>
                <p className="pt-1 text-sm font-bold text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
