import { useEffect, useState } from "react";
import { Save, Sparkles } from "lucide-react";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import {
  getPersonalizationOptions,
  getStudentProfile,
  updateStudentProfile,
} from "../../services/personalizationService";

export function StudentProfile() {
  const [options, setOptions] = useState({
    interests: [],
    explanation_styles: [],
    class_levels: [],
  });

  const [form, setForm] = useState({
    class_level: "12",
    primary_interest: "cricket",
    explanation_style: "exam_focused",
    learning_goal: "Prepare for NEB board exam with personalized revision.",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const [optionsData, profileData] = await Promise.all([
        getPersonalizationOptions(),
        getStudentProfile(),
      ]);

      setOptions(optionsData);
      setForm({
        class_level: profileData.class_level || "12",
        primary_interest: profileData.primary_interest || "cricket",
        explanation_style: profileData.explanation_style || "exam_focused",
        learning_goal:
          profileData.learning_goal ||
          "Improve weak concepts through personalized revision.",
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to load learning profile. Check login and backend.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateStudentProfile(form);
      setMessage("Learning profile updated successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Failed to update learning profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <DashboardLayout title="Learning Profile">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="glass-card p-6">
          <div className="mb-6">
            <span className="badge">
              <Sparkles className="mr-2 h-4 w-4" />
              Personalization
            </span>
            <h2 className="mt-4 text-2xl font-black text-slate-950">
              Tell NexaLearn how you learn best.
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              The AI Agent uses this profile to explain weak concepts through
              your preferred context.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-6 text-sm font-bold text-slate-500">
              Loading profile...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                  {message}
                </div>
              )}

              <div>
                <label className="label-text">Class Level</label>
                <select
                  className="input-field"
                  name="class_level"
                  value={form.class_level}
                  onChange={updateField}
                >
                  {options.class_levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text">Primary Interest</label>
                <select
                  className="input-field"
                  name="primary_interest"
                  value={form.primary_interest}
                  onChange={updateField}
                >
                  {options.interests.map((interest) => (
                    <option key={interest.value} value={interest.value}>
                      {interest.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text">Explanation Style</label>
                <select
                  className="input-field"
                  name="explanation_style"
                  value={form.explanation_style}
                  onChange={updateField}
                >
                  {options.explanation_styles.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text">Learning Goal</label>
                <textarea
                  className="input-field min-h-28 resize-y"
                  name="learning_goal"
                  value={form.learning_goal}
                  onChange={updateField}
                />
              </div>

              <button disabled={saving} className="btn-primary w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Learning Profile"}
              </button>
            </form>
          )}
        </section>

        <section className="glass-card p-6">
          <h3 className="text-xl font-black text-slate-950">
            How this improves your feedback
          </h3>

          <div className="mt-5 space-y-4">
            {[
              {
                title: "Class-wise explanation",
                text: "Class 12 students get formula, steps, units, and exam-focused explanation.",
              },
              {
                title: "Interest-based examples",
                text: "If you choose cricket, weak topics are explained using cricket strategies and match logic.",
              },
              {
                title: "Recovery task",
                text: "Instead of revising everything, you get targeted revision based on your mistake.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl bg-white p-5">
                <h4 className="font-black text-slate-950">{item.title}</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
