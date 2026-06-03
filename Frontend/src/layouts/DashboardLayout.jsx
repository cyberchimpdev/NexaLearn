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
import TutorAIWidget from "../components/student/TutorAIWidget";

function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role = user?.role || "student";
  {
    role === "student" && <TutorAIWidget />;
  }
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

  const pageTitle =
    title || (role === "teacher" ? "Teacher Dashboard" : "Student Dashboard");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34rem),radial-gradient(circle_at_top_right,rgba(79,70,229,0.10),transparent_32rem),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] text-slate-950">
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20">
              <Brain className="h-5 w-5" />
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
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-600 p-3">
                <ClipboardList className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black">Workspace</p>
                <p className="text-xs text-slate-300">
                  AI-powered learning recovery
                </p>
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
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition",
                      isActive
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-sm font-black text-slate-950">{pageTitle}</p>
              <p className="text-xs font-semibold text-slate-500">
                AI-powered learning recovery platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-black text-slate-950">
                {user?.full_name || user?.email || "NexaLearn User"}
              </p>
              <p className="text-xs font-bold capitalize text-slate-500">
                {role}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <User className="h-5 w-5" />
            </div>
          </div>
        </header>

        <section className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </section>
      </div>

      {role === "student" && <FloatingAIChatbot />}
    </main>
  );
}

export default DashboardLayout;
export { DashboardLayout };
