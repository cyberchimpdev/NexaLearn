import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpenCheck,
  Brain,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Sparkles,
  UserRoundCog,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { FloatingAIChatbot } from "../components/common/FloatingAIChatbot";

export function DashboardLayout({ title, children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const links =
    user?.role === "teacher"
      ? [
          { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
          {
            label: "Create Test",
            href: "/teacher/tests/create",
            icon: PlusCircle,
          },
        ]
      : [
          { label: "Dashboard", href: "/student", icon: LayoutDashboard },
          {
            label: "Learning Profile",
            href: "/student/profile",
            icon: UserRoundCog,
          },
          {
            label: "Available Tests",
            href: "/student/tests",
            icon: BookOpenCheck,
          },
          {
            label: "My Reports",
            href: "/student/reports",
            icon: ClipboardList,
          },
          { label: "AI Playground", href: "/student/ai", icon: Sparkles },
        ];

  return (
    <main className="page-shell">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="container-xl flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20">
              <Brain className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-black leading-none text-slate-950">
                NexaLearn
              </p>
              <p className="text-xs font-bold text-slate-500">Gap detector</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-black text-slate-950">
                {user?.full_name || "User"}
              </p>
              <p className="text-xs font-bold capitalize text-slate-500">
                {user?.role}
              </p>
            </div>

            <button onClick={handleLogout} className="btn-danger">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container-xl grid gap-6 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="glass-card h-fit p-3">
          <div className="mb-3 rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-600 p-3">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black">Workspace</p>
                <p className="text-xs text-slate-300 capitalize">
                  {user?.role} panel
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === "/teacher" || link.href === "/student"}
                  className={({ isActive }) =>
                    [
                      "nav-item flex items-center gap-3",
                      isActive ? "nav-item-active" : "nav-item-inactive",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <div className="mb-6">
            <p className="badge mb-3">NexaLearn Dashboard</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
          </div>

          {children}
        </section>
      </div>

      {user?.role === "student" && <FloatingAIChatbot />}
    </main>
  );
}
