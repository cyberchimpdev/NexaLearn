import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      const data = err?.response?.data;
      setError(
        data?.email?.[0] ||
          data?.password?.[0] ||
          data?.role?.[0] ||
          "Registration failed. Try again.",
      );
    }
  }

  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="glass-card w-full max-w-md p-6">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="mb-5 inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
          >
            ← Back to Home
          </Link>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-950">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Join as teacher or student.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="label-text">Full Name</label>
            <input
              className="input-field"
              name="full_name"
              value={form.full_name}
              onChange={updateField}
              required
            />
          </div>

          <div>
            <label className="label-text">Email</label>
            <input
              className="input-field"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
            />
          </div>

          <div>
            <label className="label-text">Password</label>
            <input
              className="input-field"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="label-text">Role</label>
            <select
              className="input-field"
              name="role"
              value={form.role}
              onChange={updateField}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
        </div>

        <button disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have account?{" "}
          <Link to="/login" className="font-bold text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
