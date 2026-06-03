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

  const listToText = (value) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "string") {
      return value;
    }

    return "";
  };

  const textToList = (value) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const fetchProfile = async () => {
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
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "daily_goal_minutes" ? Number(value) : value,
    }));

    setSuccess("");
  };

  const handleSubmit = async (event) => {
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
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-700">
              Loading learning profile...
            </p>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-900 p-6 text-white shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  Personalized Learning Profile
                </div>

                <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-4xl">
                  Tell NexaLearn how you learn best.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-50 sm:text-base">
                  Your AI explanations, mistake reviews, and revision tasks will
                  adapt based on your class, interests, weak subjects, and
                  learning style.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                  <Flame className="h-5 w-5 text-orange-200" />
                  <p className="mt-3 text-xs text-indigo-100">Current Streak</p>
                  <p className="text-2xl font-bold">
                    {profileStats.current_streak}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                  <Target className="h-5 w-5 text-emerald-200" />
                  <p className="mt-3 text-xs text-indigo-100">Longest Streak</p>
                  <p className="text-2xl font-bold">
                    {profileStats.longest_streak}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                  <Brain className="h-5 w-5 text-blue-200" />
                  <p className="mt-3 text-xs text-indigo-100">AI Mode</p>
                  <p className="text-2xl font-bold">On</p>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                <User className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Learning Details
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Use commas for multiple interests or subjects.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="grade_level"
                  className="text-sm font-semibold text-slate-700"
                >
                  Grade / Class
                </label>
                <div className="relative mt-2">
                  <GraduationCap className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="grade_level"
                    name="grade_level"
                    value={formData.grade_level}
                    onChange={handleChange}
                    placeholder="e.g. Class 12, SEE, SAT"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="learning_style"
                  className="text-sm font-semibold text-slate-700"
                >
                  Learning Style
                </label>
                <select
                  id="learning_style"
                  name="learning_style"
                  value={formData.learning_style}
                  onChange={handleChange}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="simple">Simple Explanation</option>
                  <option value="visual">Visual Learning</option>
                  <option value="story">Story Based</option>
                  <option value="example">Example Based</option>
                  <option value="practice">Practice Based</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="interestsText"
                  className="text-sm font-semibold text-slate-700"
                >
                  Interests
                </label>
                <input
                  id="interestsText"
                  name="interestsText"
                  value={formData.interestsText}
                  onChange={handleChange}
                  placeholder="e.g. cricket, anime, gaming"
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="preferredSubjectsText"
                  className="text-sm font-semibold text-slate-700"
                >
                  Preferred Subjects
                </label>
                <input
                  id="preferredSubjectsText"
                  name="preferredSubjectsText"
                  value={formData.preferredSubjectsText}
                  onChange={handleChange}
                  placeholder="e.g. Biology, Physics"
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="weakSubjectsText"
                  className="text-sm font-semibold text-slate-700"
                >
                  Weak Subjects
                </label>
                <input
                  id="weakSubjectsText"
                  name="weakSubjectsText"
                  value={formData.weakSubjectsText}
                  onChange={handleChange}
                  placeholder="e.g. Chemistry, Math"
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="daily_goal_minutes"
                  className="text-sm font-semibold text-slate-700"
                >
                  Daily Goal Minutes
                </label>
                <input
                  id="daily_goal_minutes"
                  name="daily_goal_minutes"
                  type="number"
                  min="5"
                  max="600"
                  value={formData.daily_goal_minutes}
                  onChange={handleChange}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="preferred_explanation_length"
                  className="text-sm font-semibold text-slate-700"
                >
                  Explanation Length
                </label>
                <select
                  id="preferred_explanation_length"
                  name="preferred_explanation_length"
                  value={formData.preferred_explanation_length}
                  onChange={handleChange}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </DashboardLayout>
  );
}

export default StudentProfile;
