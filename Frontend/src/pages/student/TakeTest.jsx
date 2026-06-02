import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Send,
  Sparkles,
} from "lucide-react";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { submitAttempt } from "../../services/attemptService";
import { getTestDetail } from "../../services/testService";

export function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalMarks = useMemo(() => {
    if (!test?.questions) return 0;
    return test.questions.reduce(
      (sum, question) => sum + Number(question.marks || 0),
      0,
    );
  }, [test]);

  async function loadTest() {
    setLoading(true);
    setError("");

    try {
      const data = await getTestDetail(testId);
      setTest(data);

      const initialAnswers = {};
      data.questions.forEach((question) => {
        initialAnswers[question.id] = "";
      });

      setAnswers(initialAnswers);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to load test. Check backend, login, or test availability.",
      );
    } finally {
      setLoading(false);
    }
  }

  function updateAnswer(questionId, value) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));
  }

  function validateAnswers() {
    if (!test?.questions?.length) return "This test has no questions.";

    const emptyQuestion = test.questions.find(
      (question) => !answers[question.id]?.trim(),
    );

    if (emptyQuestion) {
      return `Please answer Question ${emptyQuestion.order}.`;
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateAnswers();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        test_id: Number(testId),
        answers: test.questions.map((question) => ({
          question_id: question.id,
          student_answer: answers[question.id] || "",
        })),
      };

      const data = await submitAttempt(payload);
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.test_id?.[0] ||
          "Failed to submit test. Check backend, login token, and question IDs.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadTest();
  }, [testId]);

  if (loading) {
    return (
      <DashboardLayout title="Take Test">
        <div className="glass-card p-8 text-center text-sm font-bold text-slate-500">
          Loading test...
        </div>
      </DashboardLayout>
    );
  }

  if (error && !test) {
    return (
      <DashboardLayout title="Take Test">
        <div className="glass-card p-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>

          <Link to="/student/tests" className="btn-secondary mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tests
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (result) {
    return (
      <DashboardLayout title="AI Recovery Result">
        <TestResultView result={result} onRetake={() => setResult(null)} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Take Diagnostic Test">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <section className="glass-card p-6">
          <Link
            to="/student/tests"
            className="mb-5 inline-flex items-center text-sm font-black text-blue-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tests
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="badge">{test.class_level}</span>
              <h2 className="mt-4 text-3xl font-black text-slate-950">
                {test.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {test.subject} • {test.topic}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                {test.description ||
                  "Answer all questions carefully. NexaLearn AI will analyze your mistakes and generate a personalized recovery card."}
              </p>
            </div>

            <div className="grid min-w-60 grid-cols-2 gap-3">
              <MiniStat label="Questions" value={test.questions.length} />
              <MiniStat label="Marks" value={totalMarks} />
            </div>
          </div>
        </section>

        <section className="space-y-5">
          {test.questions.map((question, index) => (
            <article key={question.id} className="glass-card p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    Question {index + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-black leading-8 text-slate-950">
                    {question.question_text}
                  </h3>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                  <p className="text-xs font-bold text-slate-500">Marks</p>
                  <p className="text-xl font-black text-slate-950">
                    {question.marks}
                  </p>
                </div>
              </div>

              <label className="label-text">Your Answer</label>
              <textarea
                className="input-field min-h-32 resize-y"
                value={answers[question.id] || ""}
                onChange={(event) =>
                  updateAnswer(question.id, event.target.value)
                }
                placeholder="Write your answer here..."
              />
            </article>
          ))}
        </section>

        <div className="sticky bottom-4 z-20 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-slate-950">
                Submit for AI analysis
              </p>
              <p className="text-xs text-slate-500">
                NexaLearn will detect mistake type, weak concept, and revision
                task.
              </p>
            </div>

            <button disabled={submitting} className="btn-primary">
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Analyzing..." : "Submit Test"}
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function TestResultView({ result, onRetake }) {
  const passed = Number(result.percentage) >= 50;

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden">
        <div className="bg-slate-950 p-6 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black text-blue-200">
                AI analysis complete
              </span>
              <h2 className="mt-4 text-3xl font-black">{result.test_title}</h2>
              <p className="mt-2 text-sm text-slate-300">
                {result.subject} • {result.topic} • Class {result.class_level}
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-5 text-center">
              <p className="text-sm font-bold text-slate-300">Score</p>
              <p className="mt-1 text-4xl font-black">
                {result.total_score}/{result.total_marks}
              </p>
              <p className="mt-1 text-sm font-bold text-blue-200">
                {result.percentage}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <SummaryCard
            icon={passed ? CheckCircle2 : AlertCircle}
            label="Status"
            value={passed ? "Good progress" : "Needs recovery"}
          />
          <SummaryCard
            icon={Brain}
            label="AI feedback"
            value={`${result.answers.length} answer(s) analyzed`}
          />
          <SummaryCard
            icon={Sparkles}
            label="Next action"
            value="Follow revision cards"
          />
        </div>
      </section>

      <section className="space-y-5">
        {result.answers.map((answer) => (
          <article key={answer.id} className="glass-card p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <span
                  className={[
                    "inline-flex rounded-full px-3 py-1 text-xs font-black",
                    answer.is_correct
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700",
                  ].join(" ")}
                >
                  {answer.is_correct ? "Correct" : answer.mistake_type}
                </span>

                <h3 className="mt-4 text-lg font-black leading-8 text-slate-950">
                  Q{answer.order}. {answer.question_text}
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                <p className="text-xs font-bold text-slate-500">Score</p>
                <p className="text-xl font-black text-slate-950">
                  {answer.score}/{answer.marks}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <InfoBlock
                title="Your answer"
                text={answer.student_answer || "No answer"}
              />
              <InfoBlock title="Correct answer" text={answer.correct_answer} />
              <InfoBlock title="Weak concept" text={answer.weak_concept} />
              <InfoBlock title="Why this happened" text={answer.ai_reason} />
            </div>

            <div className="mt-5 rounded-3xl bg-blue-50 p-5">
              <p className="text-sm font-black text-blue-900">
                Personalized explanation
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-blue-900/80">
                {answer.interest_based_explanation}
              </p>
            </div>

            <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-black text-blue-200">Revision task</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-200">
                {answer.revision_task}
              </p>
            </div>
          </article>
        ))}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/student/tests" className="btn-primary">
          Take Another Test
        </Link>
        <button onClick={onRetake} className="btn-secondary">
          Edit Answers and Retake
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl bg-white p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}

function InfoBlock({ title, text }) {
  return (
    <div className="rounded-3xl bg-white p-5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
        {text}
      </p>
    </div>
  );
}
