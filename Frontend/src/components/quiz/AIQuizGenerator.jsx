import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { aiService } from "../../services/aiService";

export default function AIQuizGenerator() {
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    difficulty: "medium",
    total_questions: 5,
  });

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleGenerateQuiz = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const data = await aiService.generateQuiz(form);
      setQuiz(data.quiz_json);
    } catch (error) {
      setQuiz({
        title: "Error",
        questions: [],
        error: "Failed to generate quiz.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">
          AI Quiz Generator
        </h2>
        <p className="text-sm text-slate-500">
          Generate personalized practice tests from weak concepts.
        </p>
      </div>

      <form onSubmit={handleGenerateQuiz} className="grid gap-4 md:grid-cols-4">
        <input
          value={form.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          placeholder="Subject"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          required
        />

        <input
          value={form.topic}
          onChange={(event) => updateField("topic", event.target.value)}
          placeholder="Topic"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          required
        />

        <select
          value={form.difficulty}
          onChange={(event) => updateField("difficulty", event.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Sparkles size={17} />
          )}
          Generate
        </button>
      </form>

      {quiz && (
        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
          <h3 className="mb-4 font-semibold text-slate-950">{quiz.title}</h3>

          {quiz.error && <p className="text-sm text-rose-600">{quiz.error}</p>}

          <div className="space-y-4">
            {quiz.questions?.map((item, index) => (
              <article key={index} className="rounded-2xl bg-white p-4">
                <p className="font-medium text-slate-900">
                  {index + 1}. {item.question}
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {item.options?.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
                    >
                      {option}
                    </div>
                  ))}
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-indigo-600">
                    Show answer
                  </summary>
                  <p className="mt-2 text-sm text-slate-700">
                    <span className="font-semibold">Answer:</span>{" "}
                    {item.correct_answer}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.explanation}
                  </p>
                </details>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
