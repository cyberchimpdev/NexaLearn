import { useEffect, useState } from "react";
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Flame,
  GraduationCap,
  Loader2,
  Save,
  Sparkles,
  Target,
  User,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

function StudentProfile() {
  const [formData, setFormData] = useState({
    grade_level: "",
    learning_style: "simple",
    interestsText: "",
    preferredSubjectsText: "",
    weakSubjectsText: "",
    daily_goal_minutes: 30,
    preferred_explanation_length: "medium",
  });

  const [profileStats, setProfileStats] = useState({
    current_streak: 0,
    longest_streak: 0,
    last_active_date: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  function listToText(value) {
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "string") {
      return value;
    }

    return "";
  }

  function textToList(value) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/personalization/profile/");
      const profile = response.data || {};

      setFormData({
        grade_level: profile.grade_level || "",
        learning_style: profile.learning_style || "simple",
        interestsText: listToText(profile.interests),
        preferredSubjectsText: listToText(profile.preferred_subjects),
        weakSubjectsText: listToText(profile.weak_subjects),
        daily_goal_minutes: profile.daily_goal_minutes || 30,
        preferred_explanation_length:
          profile.preferred_explanation_length || "medium",
      });

      setProfileStats({
        current_streak: profile.current_streak || 0,
        longest_streak: profile.longest_streak || 0,
        last_active_date: profile.last_active_date || null,
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Could not load your learning profile. You can still fill and save it.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "daily_goal_minutes" ? Number(value) : value,
    }));

    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.grade_level.trim()) {
      setError("Grade level is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      grade_level: formData.grade_level.trim(),
      learning_style: formData.learning_style,
      interests: textToList(formData.interestsText),
      preferred_subjects: textToList(formData.preferredSubjectsText),
      weak_subjects: textToList(formData.weakSubjectsText),
      daily_goal_minutes: Number(formData.daily_goal_minutes) || 30,
      preferred_explanation_length: formData.preferred_explanation_length,
    };

    try {
      const response = await api.patch("/personalization/profile/", payload);
      const updatedProfile = response.data || {};

      setProfileStats({
        current_streak:
          updatedProfile.current_streak || profileStats.current_streak,
        longest_streak:
          updatedProfile.longest_streak || profileStats.longest_streak,
        last_active_date:
          updatedProfile.last_active_date || profileStats.last_active_date,
      });

      setSuccess("Learning profile updated successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Could not save your profile. Check backend personalization API.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Learning Profile">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
            <p className="text-sm font-semibold text-slate-700">
              Loading learning profile...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Learning Profile">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_52%,#22c55e_100%)] p-6 text-white shadow-xl shadow-sky-500/15 sm:p-8">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[1fr_430px] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Personalized Learning Profile
              </div>

              <h1 className="mt-6 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                Tell NexaLearn how you learn best.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-sky-50 sm:text-base">
                Your explanations, mistake reviews, and revision tasks adapt
                based on your class, interests, weak subjects, explanation
                length, and learning style.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <HeroStat
                icon={Flame}
                label="Current Streak"
                value={profileStats.current_streak}
                tone="orange"
              />

              <HeroStat
                icon={Target}
                label="Longest Streak"
                value={profileStats.longest_streak}
                tone="emerald"
              />

              <HeroStat icon={Brain} label="Tutor Mode" value="On" tone="sky" />
            </div>
          </div>
        </section>

        {error ? (
          <AlertBanner
            type="error"
            icon={AlertCircle}
            title="Profile warning"
            message={error}
          />
        ) : null}

        {success ? (
          <AlertBanner
            type="success"
            icon={CheckCircle2}
            title="Saved"
            message={success}
          />
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] text-white shadow-lg shadow-sky-200/70">
                <User className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Learning Details
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Use commas for multiple interests or subjects. Keep this
                  updated for better explanation quality.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] px-6 py-3 text-sm font-black text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <TextField
              label="Grade / Class"
              id="grade_level"
              name="grade_level"
              value={formData.grade_level}
              onChange={handleChange}
              placeholder="e.g. Class 12, SEE, SAT"
              icon={GraduationCap}
            />

            <SelectField
              label="Learning Style"
              id="learning_style"
              name="learning_style"
              value={formData.learning_style}
              onChange={handleChange}
              options={[
                { value: "simple", label: "Simple Explanation" },
                { value: "visual", label: "Visual Learning" },
                { value: "story", label: "Story Based" },
                { value: "example", label: "Example Based" },
                { value: "practice", label: "Practice Based" },
              ]}
            />

            <TextField
              label="Interests"
              id="interestsText"
              name="interestsText"
              value={formData.interestsText}
              onChange={handleChange}
              placeholder="e.g. cricket, anime, gaming"
            />

            <TextField
              label="Preferred Subjects"
              id="preferredSubjectsText"
              name="preferredSubjectsText"
              value={formData.preferredSubjectsText}
              onChange={handleChange}
              placeholder="e.g. Biology, Physics"
            />

            <TextField
              label="Weak Subjects"
              id="weakSubjectsText"
              name="weakSubjectsText"
              value={formData.weakSubjectsText}
              onChange={handleChange}
              placeholder="e.g. Chemistry, Math"
            />

            <TextField
              label="Daily Goal Minutes"
              id="daily_goal_minutes"
              name="daily_goal_minutes"
              type="number"
              min="5"
              max="600"
              value={formData.daily_goal_minutes}
              onChange={handleChange}
            />

            <SelectField
              label="Explanation Length"
              id="preferred_explanation_length"
              name="preferred_explanation_length"
              value={formData.preferred_explanation_length}
              onChange={handleChange}
              options={[
                { value: "short", label: "Short" },
                { value: "medium", label: "Medium" },
                { value: "detailed", label: "Detailed" },
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <div className="flex items-start gap-3">
              <Brain className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
              <p className="text-sm leading-7 text-sky-900">
                Better profile data gives better Tutor AI explanations. Example:
                if you add “cricket” as an interest, NexaLearn can explain hard
                concepts using cricket-based examples when useful.
              </p>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function HeroStat({ icon: Icon, label, value, tone = "sky" }) {
  const tones = {
    sky: "text-sky-200",
    emerald: "text-emerald-200",
    orange: "text-orange-200",
  };

  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur">
      <Icon className={`h-5 w-5 ${tones[tone] || tones.sky}`} />
      <p className="mt-3 text-xs font-bold text-sky-100">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function AlertBanner({ type, icon: Icon, title, message }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-5 text-sm ${
        styles[type] || styles.error
      }`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-black">{title}</p>
        <p className="mt-1 font-medium">{message}</p>
      </div>
    </div>
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

function SelectField({ label, id, options, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-black text-slate-700">
        {label}
      </label>

      <select
        id={id}
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default StudentProfile;
