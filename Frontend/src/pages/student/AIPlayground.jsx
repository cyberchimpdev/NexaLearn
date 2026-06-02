import { useState } from "react";
import { Brain, Sparkles, Wand2 } from "lucide-react";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { analyzeAnswer } from "../../services/aiService";

export function AIPlayground() {
  const [form, setForm] = useState({
    class_level: "12",
    subject: "Physics",
    topic: "Electric Field",
    question:
      "A charge of 2 C experiences a force of 10 N. Find the electric field.",
    correct_answer: "5 N/C",
    student_answer: "20 N/C",
    marks: 2,
    student_interest: "cricket",
    explanation_style: "exam_focused",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "marks" ? Number(value) : value,
    }));
  }

  async function handleAnalyze(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await analyzeAnswer(form);
      setResult(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "AI analysis failed. Check backend server and login token.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="AI Playground">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="glass-card p-6">
          <span className="badge">
            <Brain className="mr-2 h-4 w-4" />
            Python AI Agent
          </span>

          <h2 className="mt-4 text-2xl font-black text-slate-950">
            Test NexaLearn AI directly.
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-600">
            This directly calls <strong>/api/ai/analyze-answer/</strong>.
          </p>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleAnalyze} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Class Level"
                name="class_level"
                value={form.class_level}
                onChange={updateField}
              />
              <Input
                label="Subject"
                name="subject"
                value={form.subject}
                onChange={updateField}
              />
              <Input
                label="Topic"
                name="topic"
                value={form.topic}
                onChange={updateField}
              />
              <Input
                label="Marks"
                name="marks"
                type="number"
                value={form.marks}
                onChange={updateField}
              />
            </div>

            <div>
              <label className="label-text">Student Interest</label>
              <select
                className="input-field"
                name="student_interest"
                value={form.student_interest}
                onChange={updateField}
              >
                <option value="anime">Anime</option>
                <option value="cricket">Cricket</option>
                <option value="gaming">Gaming</option>
                <option value="movies">Movies</option>
                <option value="real_life">Real Life</option>
                <option value="textbook">Textbook Style</option>
              </select>
            </div>

            <TextArea
              label="Question"
              name="question"
              value={form.question}
              onChange={updateField}
            />
            <TextArea
              label="Correct Answer"
              name="correct_answer"
              value={form.correct_answer}
              onChange={updateField}
            />
            <TextArea
              label="Student Answer"
              name="student_answer"
              value={form.student_answer}
              onChange={updateField}
            />

            <button disabled={loading} className="btn-primary w-full">
              <Wand2 className="mr-2 h-4 w-4" />
              {loading ? "Analyzing..." : "Run AI Analysis"}
            </button>
          </form>
        </section>

        <section className="glass-card p-6">
          <span className="badge">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Output
          </span>

          {!result ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Brain className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-4 text-lg font-black text-slate-950">
                No AI result yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Click Run AI Analysis.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <ResultCard
                label="Correct?"
                value={result.is_correct ? "Yes" : "No"}
              />
              <ResultCard label="Score" value={String(result.score)} />
              <ResultCard label="Mistake Type" value={result.mistake_type} />
              <ResultCard label="Weak Concept" value={result.weak_concept} />
              <ResultCard label="Reason" value={result.reason} />
              <ResultCard
                label="Correct Solution"
                value={result.correct_solution}
              />
              <ResultCard
                label="Interest-Based Explanation"
                value={result.interest_based_explanation}
              />
              <ResultCard label="Revision Task" value={result.revision_task} />
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

function TextArea({ label, ...props }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <textarea className="input-field min-h-24 resize-y" {...props} />
    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="rounded-3xl bg-white p-5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
        {value}
      </p>
    </div>
  );
}
