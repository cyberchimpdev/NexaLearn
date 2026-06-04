import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpenCheck,
  Brain,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  PlusCircle,
  Sparkles,
  User,
  UserRoundCog,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import FloatingAIChatbot from "../components/common/FloatingAIChatbot";
import logo from "../assets/logo.png";

function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role = user?.role || "student";

  const studentLinks = [
    {
      label: "Dashboard",
      to: "/student",
      icon: Home,
    },
    {
      label: "Learning Profile",
      to: "/student/profile",
      icon: UserRoundCog,
    },
    {
      label: "Teacher Tests",
      to: "/student/tests",
      icon: BookOpenCheck,
    },
    {
      label: "AI Practice Test",
      to: "/student/ai-practice",
      icon: Sparkles,
    },
    {
      label: "My Reports",
      to: "/student/reports",
      icon: BarChart3,
    },
    {
      label: "NexaLearn AI",
      to: "/student/ai",
      icon: Brain,
    },
  ];

  const teacherLinks = [
    {
      label: "Dashboard",
      to: "/teacher",
      icon: Home,
    },
    {
      label: "Create Test",
      to: "/teacher/tests/create",
      icon: PlusCircle,
    },
  ];

  const links = role === "teacher" ? teacherLinks : studentLinks;

  const pageTitle =
    title || (role === "teacher" ? "Teacher Dashboard" : "Student Dashboard");

  function handleLogout() {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("nexalearn_access_token");
      localStorage.removeItem("nexalearn_refresh_token");
      localStorage.removeItem("nexalearn_user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("refresh");
      localStorage.removeItem("token");
    }

    navigate("/");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.15),transparent_34rem),radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_32rem),linear-gradient(180deg,#f8fafc_0%,#eef8ff_52%,#f8fafc_100%)] text-slate-950">
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl transition-transform duration-300 ease-out lg:translate-x-0 lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link
            to={role === "teacher" ? "/teacher" : "/student"}
            className="group flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-sky-300/30 blur-lg opacity-0 transition group-hover:opacity-100" />
              <img
                src={logo}
                alt="NexaLearn Logo"
                className="relative h-12 w-12 rounded-2xl object-contain transition duration-300 group-hover:scale-105"
              />
            </div>

            <div>
              <p className="text-sm font-black leading-none text-slate-950">
                NexaLearn
              </p>
              <p className="text-xs font-bold capitalize text-slate-500">
                {role} panel
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
          <div>
            <div className="mb-4 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_55%,#22c55e_100%)] p-5 text-white shadow-xl shadow-sky-900/15">
              <div className="relative">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-300/25 blur-2xl" />
                <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-emerald-300/20 blur-2xl" />

                <div className="relative flex items-center gap-3">
                  <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/15">
                    <ClipboardList className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black">Workspace</p>
                    <p className="text-xs text-slate-200">
                      Learning recovery dashboard
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {links.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/student" || item.to === "/teacher"}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition duration-200",
                        isActive
                          ? "bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] text-white shadow-lg shadow-sky-500/25"
                          : "text-slate-600 hover:bg-sky-50 hover:text-sky-700",
                      ].join(" ")
                    }
                  >
                    <Icon className="h-4 w-4 transition group-hover:scale-110" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-lg hover:shadow-rose-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition lg:hidden"
        />
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-2xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-600 transition hover:bg-sky-50 hover:text-sky-700 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">
                {pageTitle}
              </p>
              <p className="hidden text-xs font-semibold text-slate-500 sm:block">
                Human-centered learning recovery platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-[14rem] truncate text-sm font-black text-slate-950">
                {user?.full_name || user?.email || "NexaLearn User"}
              </p>
              <p className="text-xs font-bold capitalize text-slate-500">
                {role}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
              <User className="h-5 w-5" />
            </div>
          </div>
        </header>

        <section className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </section>
      </div>

      {role === "student" ? <FloatingAIChatbot /> : null}
    </main>
  );
}

export default DashboardLayout;
export { DashboardLayout };
