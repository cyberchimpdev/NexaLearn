import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  GraduationCap,
  Layers3,
  Loader2,
  Plus,
  Save,
  Target,
  Trash2,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

function CreateTest() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    topic: "",
    grade_level: "",
    description: "",
    duration_minutes: 30,
  });

  const [questions, setQuestions] = useState([
    {
      question_text: "",
      question_type: "short_answer",
      correct_answer: "",
      marks: 2,
      explanation: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFormChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "duration_minutes" ? Number(value) : value,
    }));

    setError("");
  }

  function handleQuestionChange(index, field, value) {
    setQuestions((previous) =>
      previous.map((question, questionIndex) =>
        questionIndex === index
          ? {
              ...question,
              [field]: field === "marks" ? Number(value) : value,
            }
          : question,
      ),
    );

    setError("");
  }

  function addQuestion() {
    setQuestions((previous) => [
      ...previous,
      {
        question_text: "",
        question_type: "short_answer",
        correct_answer: "",
        marks: 2,
        explanation: "",
      },
    ]);
  }

  function removeQuestion(index) {
    setQuestions((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter((_, questionIndex) => questionIndex !== index);
    });
  }

  function validatePayload() {
    if (!formData.title.trim()) {
      return "Test title is required.";
    }

    if (!formData.subject.trim()) {
      return "Subject is required.";
    }

    if (!formData.grade_level.trim()) {
      return "Grade level is required.";
    }

    const hasInvalidQuestion = questions.some(
      (question) =>
        !question.question_text.trim() || !question.correct_answer.trim(),
    );

    if (hasInvalidQuestion) {
      return "Every question must have question text and correct answer.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validatePayload();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      questions,
    };

    try {
      const response = await api.post("/tests/", payload);
      const testId = response.data?.id || response.data?.test?.id;

      if (testId) {
        navigate(`/teacher/tests/${testId}/report`);
        return;
      }

      navigate("/teacher");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Failed to create test. Check backend tests API route.",
      );
    } finally {
      setLoading(false);
    }
  }

  const totalMarks = questions.reduce(
    (sum, question) => sum + Number(question.marks || 0),
    0,
  );

  return (
    <DashboardLayout title="Create Test">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_52%,#22c55e_100%)] p-6 text-white shadow-xl shadow-sky-500/15 sm:p-8">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_340px] lg:items-center">
            <div>
              <button
                type="button"
                onClick={() => navigate("/teacher")}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </button>

              <h1 className="mt-6 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                Create a diagnostic test for learning gap detection.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-sky-50 sm:text-base">
                Add class, subject, topic, questions, marks, and correct answers
                so NexaLearn can detect weak concepts and generate useful
                recovery feedback.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-700">
                  <BookOpen className="h-7 w-7" />
                </div>

                <div>
                  <p className="text-sm font-bold text-sky-100">Test Builder</p>
                  <h2 className="mt-1 text-xl font-black text-white">
                    Teacher reviewed
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <HeroStat label="Questions" value={questions.length} />
                <HeroStat label="Marks" value={totalMarks} />
                <HeroStat
                  label="Duration"
                  value={`${formData.duration_minutes || 0}m`}
                />
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </section>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeader
              icon={FileText}
              title="Test Information"
              description="Define the test metadata students and reports will use."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <TextField
                label="Test Title"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g. Photosynthesis Diagnostic Test"
              />

              <TextField
                label="Subject"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleFormChange}
                placeholder="e.g. Biology"
                icon={BookOpen}
              />

              <TextField
                label="Topic"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleFormChange}
                placeholder="e.g. Plant Physiology"
                icon={Target}
              />

              <TextField
                label="Grade Level"
                id="grade_level"
                name="grade_level"
                value={formData.grade_level}
                onChange={handleFormChange}
                placeholder="e.g. Class 12"
                icon={GraduationCap}
              />

              <TextField
                label="Duration Minutes"
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min="5"
                value={formData.duration_minutes}
                onChange={handleFormChange}
                icon={Clock}
              />

              <div className="md:col-span-2">
                <TextareaField
                  label="Description"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder="Describe what this test checks..."
                />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <SectionHeader
                icon={Layers3}
                title="Questions"
                description="Add question text, correct answer, marks, and optional marking notes."
              />

              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-black text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-100"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {questions.map((question, index) => (
                <QuestionEditor
                  key={index}
                  question={question}
                  index={index}
                  canRemove={questions.length > 1}
                  onChange={handleQuestionChange}
                  onRemove={removeQuestion}
                />
              ))}
            </div>
          </section>

          <div className="sticky bottom-5 z-20 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] px-6 py-4 text-sm font-black text-white shadow-2xl shadow-sky-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {loading ? "Creating..." : "Create Test"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
      <p className="text-xs font-bold text-sky-100">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] text-white shadow-lg shadow-sky-200/70">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
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

function TextareaField({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-black text-slate-700">
        {label}
      </label>

      <textarea
        id={id}
        className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        {...props}
      />
    </div>
  );
}

function QuestionEditor({ question, index, canRemove, onChange, onRemove }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:border-sky-200 hover:bg-sky-50/40">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-100">
            Question {index + 1}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <TextareaField
            label="Question Text"
            value={question.question_text}
            onChange={(event) =>
              onChange(index, "question_text", event.target.value)
            }
            rows={3}
            placeholder="Write the question..."
          />
        </div>

        <div>
          <label className="text-sm font-black text-slate-700">
            Question Type
          </label>
          <select
            value={question.question_type}
            onChange={(event) =>
              onChange(index, "question_type", event.target.value)
            }
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          >
            <option value="short_answer">Short Answer</option>
            <option value="mcq">MCQ</option>
            <option value="long_answer">Long Answer</option>
          </select>
        </div>

        <TextField
          label="Marks"
          type="number"
          min="1"
          value={question.marks}
          onChange={(event) => onChange(index, "marks", event.target.value)}
        />

        <div className="md:col-span-2">
          <TextareaField
            label="Correct Answer"
            value={question.correct_answer}
            onChange={(event) =>
              onChange(index, "correct_answer", event.target.value)
            }
            rows={3}
            placeholder="Write the correct answer..."
          />
        </div>

        <div className="md:col-span-2">
          <TextareaField
            label="Explanation / Marking Note"
            value={question.explanation}
            onChange={(event) =>
              onChange(index, "explanation", event.target.value)
            }
            rows={3}
            placeholder="Optional teacher explanation..."
          />
        </div>
      </div>
    </div>
  );
}

export default CreateTest;
