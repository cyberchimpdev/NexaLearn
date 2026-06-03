import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, ClipboardCheck, Save, Sparkles } from "lucide-react";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { generateQuiz } from "../../services/aiService";
import { createTest } from "../../services/testService";

export function AIGenerateTest() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subject: "Physics",
    topic: "Electric Field",
    class_level: "12",
    difficulty: "medium",
    question_count: 5,
    marks_per_question: 2,
    publish: true,
  });

  const [generatedTest, setGeneratedTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : ["question_count", "marks_per_question"].includes(name)
            ? Number(value)
            : value,
    }));
  }

  async function handleGenerate(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setGeneratedTest(null);

    try {
      const data = await generateQuiz(form);
      setGeneratedTest(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "AI quiz generation failed. Check Gemini setup or backend."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTest() {
    if (!generatedTest) return;

    setSaving(true);
    setError("");

    try {
      const created = await createTest({
        ...generatedTest,
        is_published: form.publish,
      });

      navigate(`/teacher/tests/${created.id}/report`);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to save generated test. Check test serializer."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="AI Generate Test">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-card p-6">
          <span className="badge">
            <Bot className="mr-2 h-4 w-4" />
            AI Test Builder
          </span>

          <h2 className="mt-4 text-2xl font-black text-slate-950">
            Generate a diagnostic test automatically.
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-600">
            Enter subject, topic, class level, difficulty, and question count.
            AI will generate a test that you can save.
          </p>

          {error && (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleGenerate} className="mt-6 space-y-4">
            <Input label="Subject" name="subject" value={form.subject} onChange={updateField} />
            <Input label="Topic" name="topic" value={form.topic} onChange={updateField} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Class Level" name="class_level" value={form.class_level} onChange={updateField} />

              <div>
                <label className="label-text">Difficulty</label>
                <select
                  className="input-field"
                  name="difficulty"
                  value={form.difficulty}
                  onChange={updateField}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <Input
                label="Question Count"
                name="question_count"
                type="number"
                min="1"
                max="20"
                value={form.question_count}
                onChange={updateField}
              />

              <Input
                label="Marks per Question"
                name="marks_per_question"
                type="number"
                min="1"
                max="10"
                value={form.marks_per_question}
                onChange={updateField}
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <input
                type="checkbox"
                name="publish"
                checked={form.publish}
                onChange={updateField}
                className="h-5 w-5"
              />
              <span className="text-sm font-bold text-slate-700">
                Publish for students after saving
              </span>
            </label>

            <button disabled={loading} className="btn-primary w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? "Generating..." : "Generate Test"}
            </button>
          </form>
        </section>

        <section className="glass-card p-6">
          <span className="badge">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Generated Preview
          </span>

          {!generatedTest ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h3 className="text-lg font-black text-slate-950">
                No test generated yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Fill the form and click Generate Test.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="rounded-3xl bg-white p-5">
                <h3 className="text-xl font-black text-slate-950">
                  {generatedTest.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {generatedTest.subject} • {generatedTest.topic} • Class{" "}
                  {generatedTest.class_level}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {generatedTest.description}
                </p>
              </div>

              <div className="space-y-3">
                {generatedTest.questions?.map((question) => (
                  <div
                    key={question.order}
                    className="rounded-3xl border border-slate-200 bg-white p-5"
                  >
                    <p className="text-sm font-black text-slate-950">
                      Q{question.order}. {question.question_text}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Answer: {question.correct_answer}
                    </p>
                    <p className="mt-2 text-xs font-bold text-slate-500">
                      Marks: {question.marks}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveTest}
                disabled={saving}
                className="btn-primary w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Generated Test"}
              </button>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <input className="input-field" {...props} />
    </div>
  );
}
