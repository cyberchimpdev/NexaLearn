import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { loginWithGoogle } from "../../services/authService";
import logo from "../../assets/logo.png";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  function resolveRedirectPath(responseData) {
    const role =
      responseData?.user?.role ||
      responseData?.role ||
      responseData?.user_type ||
      "";

    return typeof role === "string" && role.toLowerCase() === "teacher"
      ? "/teacher"
      : "/student";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login({
        email,
        password,
      });

      navigate(resolveRedirectPath(response), { replace: true });
    } catch (err) {
      setError(getReadableError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    const credential = credentialResponse?.credential;

    if (!credential) {
      setError("Google login failed. Credential was not received.");
      return;
    }

    setGoogleLoading(true);
    setError("");

    try {
      const response = await loginWithGoogle(credential);
      navigate(resolveRedirectPath(response), { replace: true });
    } catch (err) {
      setError(getReadableError(err, "Google login failed. Please try again."));
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleGoogleError() {
    setError("Google login was cancelled or failed.");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_52%,#22c55e_100%)] px-8 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute -bottom-32 left-10 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative">
            <Link to="/" className="group inline-flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 blur-lg transition group-hover:opacity-100" />
                <img
                  src={logo}
                  alt="NexaLearn logo"
                  className="relative h-12 w-12 rounded-2xl object-contain transition group-hover:scale-105"
                />
              </div>

              <div>
                <p className="text-lg font-black leading-none">NexaLearn</p>
                <p className="mt-1 text-xs font-semibold text-sky-100">
                  Learning Recovery Platform
                </p>
              </div>
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Human-centered learning recovery
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              Welcome back to NexaLearn.
            </h1>

            <p className="mt-5 text-base leading-8 text-sky-50">
              Continue diagnosing learning gaps, reviewing recovery cards, and
              turning student mistakes into measurable progress.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Mistake analysis and weak concept detection",
                "Interest-based explanations for students",
                "Teacher reports and remedial groups",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  <p className="text-sm font-bold text-sky-50">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative text-sm font-medium text-sky-100">
            © {new Date().getFullYear()} NexaLearn
          </div>
        </section>

        <section className="relative flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-4 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />

          <div className="relative w-full max-w-md">
            <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl shadow-sky-100/60 backdrop-blur sm:p-8">
              <div className="lg:hidden">
                <Link to="/" className="mb-6 inline-flex items-center gap-3">
                  <img
                    src={logo}
                    alt="NexaLearn logo"
                    className="h-12 w-12 rounded-2xl object-contain"
                  />

                  <div>
                    <p className="text-lg font-black text-slate-950">
                      NexaLearn
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      Learning Recovery Platform
                    </p>
                  </div>
                </Link>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-black text-sky-700">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Secure dashboard access
                </div>

                <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
                  Login
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sign in to continue to your student or teacher dashboard.
                </p>
              </div>

              {error ? (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              ) : null}

              <div className="mt-6">
                <div
                  className={
                    googleLoading ? "pointer-events-none opacity-60" : ""
                  }
                >
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                    width="100%"
                    useOneTap={false}
                  />
                </div>

                {googleLoading ? (
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting Google account...
                  </div>
                ) : null}
              </div>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  or
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <TextField
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  icon={Mail}
                />

                <div>
                  <label
                    htmlFor="password"
                    className="text-sm font-black text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative mt-2">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
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
                  disabled={loading || googleLoading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] px-5 text-sm font-black text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="font-black text-sky-700 transition hover:text-emerald-600"
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

function TextField({ label, id, icon: Icon, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-black text-slate-700">
        {label}
      </label>

      <div className="relative mt-2">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
        ) : null}

        <input
          id={id}
          className={[
            "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100",
            Icon ? "pl-11" : "",
          ].join(" ")}
          {...props}
        />
      </div>
    </div>
  );
}

function getReadableError(
  err,
  fallback = "Login failed. Please check your credentials and try again.",
) {
  const apiError = err?.response?.data;

  if (!apiError) {
    return fallback;
  }

  if (typeof apiError === "string") {
    return apiError;
  }

  return (
    apiError?.detail ||
    apiError?.error ||
    apiError?.message ||
    apiError?.non_field_errors?.[0] ||
    Object.values(apiError).flat().join(" ") ||
    fallback
  );
}

export default Login;
