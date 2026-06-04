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
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "student",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  function validateForm() {
    if (!formData.full_name.trim()) {
      return "Full name is required.";
    }

    if (!formData.email.trim()) {
      return "Email is required.";
    }

    if (!formData.password.trim()) {
      return "Password is required.";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (formData.password !== formData.confirm_password) {
      return "Password and confirm password do not match.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      full_name: formData.full_name.trim(),
      name: formData.full_name.trim(),
      username: formData.email.trim(),
      email: formData.email.trim(),
      password: formData.password,
      password2: formData.confirm_password,
      confirm_password: formData.confirm_password,
      role: formData.role,
    };

    try {
      await register(payload);
      navigate("/login", { replace: true });
    } catch (err) {
      const apiError = err?.response?.data;

      const message =
        apiError?.detail ||
        apiError?.error ||
        apiError?.message ||
        apiError?.email?.[0] ||
        apiError?.username?.[0] ||
        apiError?.password?.[0] ||
        apiError?.non_field_errors?.[0] ||
        "Registration failed. Please check your details and try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
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
                <div className="absolute inset-0 rounded-2xl bg-white/20 blur-lg opacity-0 transition group-hover:opacity-100" />
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
              <Users className="h-4 w-4" />
              Built for students and teachers
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              Create your NexaLearn account.
            </h1>

            <p className="mt-5 text-base leading-8 text-sky-50">
              Start detecting learning gaps, generating personalized recovery
              tasks, and improving classroom feedback with human-centered
              learning support.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Teacher diagnostic test creation",
                "Student mistake analysis",
                "Personalized recovery explanations",
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
                  <Sparkles className="h-3.5 w-3.5" />
                  Create dashboard access
                </div>

                <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
                  Register
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Create an account to start using NexaLearn as a student or
                  teacher.
                </p>
              </div>

              {error ? (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <TextField
                  label="Full Name"
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  icon={User}
                />

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
                    htmlFor="role"
                    className="text-sm font-black text-slate-700"
                  >
                    Account Type
                  </label>

                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>

                <PasswordField
                  label="Password"
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  show={showPassword}
                  onToggle={() => setShowPassword((previous) => !previous)}
                />

                <PasswordField
                  label="Confirm Password"
                  id="confirm_password"
                  name="confirm_password"
                  autoComplete="new-password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  show={showConfirmPassword}
                  onToggle={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] px-5 text-sm font-black text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-black text-sky-700 transition hover:text-emerald-600"
                >
                  Login
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

function PasswordField({ label, id, show, onToggle, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-black text-slate-700">
        {label}
      </label>

      <div className="relative mt-2">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />

        <input
          id={id}
          type={show ? "text" : "password"}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          {...props}
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default Register;
