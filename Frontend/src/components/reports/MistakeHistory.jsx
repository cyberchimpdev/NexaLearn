import { useEffect, useState } from "react";
import { AlertCircle, BookOpen, Loader2 } from "lucide-react";
import { aiService } from "../../services/aiService";

export default function MistakeHistory() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMistakes = async () => {
    try {
      setLoading(true);
      const data = await aiService.getMistakes();
      setMistakes(data);
    } catch (error) {
      setMistakes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMistakes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-8">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertCircle size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Mistake History
          </h2>
          <p className="text-sm text-slate-500">
            View your past mistakes anytime and revise weak concepts.
          </p>
        </div>
      </div>

      {mistakes.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
          No mistakes recorded yet. Submit a test to get AI feedback.
        </div>
      ) : (
        <div className="space-y-4">
          {mistakes.map((mistake) => (
            <article
              key={mistake.id}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {mistake.subject}
                </span>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                  {mistake.topic}
                </span>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                  {mistake.mistake_type}
                </span>
              </div>

              <h3 className="font-semibold text-slate-900">
                Weak Concept: {mistake.weak_concept}
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Question:</span>{" "}
                {mistake.question}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Your answer:</span>{" "}
                {mistake.student_answer}
              </p>

              <div className="mt-4 rounded-xl bg-white p-4 text-sm leading-7 text-slate-700">
                {mistake.explanation}
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
                <BookOpen size={18} className="mt-0.5 shrink-0" />
                <p>{mistake.revision_task}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
