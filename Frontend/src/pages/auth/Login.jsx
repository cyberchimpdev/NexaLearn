import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resolveRedirectPath = (responseData) => {
    const role =
      responseData?.user?.role ||
      responseData?.role ||
      responseData?.user_type ||
      "";

    if (typeof role === "string" && role.toLowerCase() === "teacher") {
      return "/teacher";
    }

    return "/student";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!formData.password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate(resolveRedirectPath(response), { replace: true });
    } catch (err) {
      const apiError = err?.response?.data;

      const message =
        apiError?.detail ||
        apiError?.error ||
        apiError?.message ||
        (typeof apiError === "object"
          ? Object.values(apiError).flat().join(" ")
          : "") ||
        "Login failed. Please check your credentials and try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden bg-slate-950 px-8 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <p className="text-lg font-bold">NexaLearn</p>
                <p className="text-xs text-slate-400">
                  AI Learning Recovery Platform
                </p>
              </div>
            </Link>
          </div>

          <div className="mx-auto w-full max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-indigo-200">
              <ArrowRight className="h-4 w-4" />
              Personalized education with AI
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight">
              Welcome back to NexaLearn
            </h1>

            <p className="mt-5 text-base leading-8 text-slate-300">
              Continue diagnosing learning gaps, reviewing recovery cards, and
              turning student mistakes into measurable progress.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "AI-powered mistake analysis",
                "Interest-based explanations",
                "Teacher reports and remedial groups",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                  <p className="text-sm font-medium text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} NexaLearn
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="lg:hidden">
                <Link to="/" className="mb-6 inline-flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-white">
                    <GraduationCap className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-lg font-bold text-slate-950">
                      NexaLearn
                    </p>
                    <p className="text-xs text-slate-500">
                      AI Learning Recovery Platform
                    </p>
                  </div>
                </Link>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  Login
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sign in to continue to your dashboard.
                </p>
              </div>

              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Email
                  </label>

                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative mt-2">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {loading ? "Signing in..." : "Login"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Do not have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
