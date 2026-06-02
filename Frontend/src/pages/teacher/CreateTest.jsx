import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Save, Trash2 } from "lucide-react";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { createTest } from "../../services/testService";

const emptyQuestion = {
  question_text: "",
  correct_answer: "",
  marks: 1,
  difficulty: "easy",
  order: 1,
};

export function CreateTest() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "Class 12 Electric Field Quick Test",
    subject: "Physics",
    topic: "Electric Field",
    class_level: "12",
    difficulty: "medium",
    description:
      "Quick diagnostic test to detect formula and concept mistakes.",
    is_published: true,
    questions: [
      {
        question_text:
          "A charge of 2 C experiences a force of 10 N. Find the electric field.",
        correct_answer: "5 N/C",
        marks: 2,
        difficulty: "easy",
        order: 1,
      },
      {
        question_text:
          "State the formula of electric field in terms of force and charge.",
        correct_answer: "E = F/q",
        marks: 1,
        difficulty: "easy",
        order: 2,
      },
    ],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function updateQuestion(index, field, value) {
    setForm((previous) => {
      const questions = previous.questions.map((question, questionIndex) => {
        if (questionIndex !== index) return question;

        return {
          ...question,
          [field]:
            field === "marks" || field === "order" ? Number(value) : value,
        };
      });

      return {
        ...previous,
        questions,
      };
    });
  }

  function addQuestion() {
    setForm((previous) => ({
      ...previous,
      questions: [
        ...previous.questions,
        {
          ...emptyQuestion,
          order: previous.questions.length + 1,
        },
      ],
    }));
  }

  function removeQuestion(index) {
    setForm((previous) => {
      const questions = previous.questions
        .filter((_, questionIndex) => questionIndex !== index)
        .map((question, questionIndex) => ({
          ...question,
          order: questionIndex + 1,
        }));

      return {
        ...previous,
        questions,
      };
    });
  }

  function validateForm() {
    if (!form.title.trim()) return "Test title is required.";
    if (!form.subject.trim()) return "Subject is required.";
    if (!form.topic.trim()) return "Topic is required.";
    if (!form.class_level.trim()) return "Class level is required.";
    if (!form.questions.length) return "At least one question is required.";

    for (const [index, question] of form.questions.entries()) {
      if (!question.question_text.trim()) {
        return `Question ${index + 1} text is required.`;
      }

      if (!question.correct_answer.trim()) {
        return `Question ${index + 1} correct answer is required.`;
      }

      if (Number(question.marks) <= 0) {
        return `Question ${index + 1} marks must be greater than 0.`;
      }
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        questions: form.questions.map((question, index) => ({
          ...question,
          marks: Number(question.marks),
          order: index + 1,
        })),
      };

      const createdTest = await createTest(payload);
      navigate(`/teacher/tests/${createdTest.id}/report`);
    } catch (err) {
      const data = err?.response?.data;
      setError(
        data?.detail ||
          data?.questions?.[0] ||
          data?.title?.[0] ||
          "Failed to create test. Check your backend server and token.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout title="Create Diagnostic Test">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <section className="glass-card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-950">
              Test Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Create a class-wise diagnostic test. NexaLearn will use this data
              to detect weak concepts after student submission.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label-text">Test Title</label>
              <input
                className="input-field"
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="e.g. Class 12 Electric Field Quick Test"
              />
            </div>

            <div>
              <label className="label-text">Subject</label>
              <input
                className="input-field"
                name="subject"
                value={form.subject}
                onChange={updateField}
                placeholder="Physics"
              />
            </div>

            <div>
              <label className="label-text">Topic</label>
              <input
                className="input-field"
                name="topic"
                value={form.topic}
                onChange={updateField}
                placeholder="Electric Field"
              />
            </div>

            <div>
              <label className="label-text">Class Level</label>
              <select
                className="input-field"
                name="class_level"
                value={form.class_level}
                onChange={updateField}
              >
                {[
                  "6",
                  "7",
                  "8",
                  "9",
                  "10",
                  "11",
                  "12",
                  "SEE",
                  "NEB",
                  "SAT",
                  "IELTS",
                  "PTE",
                ].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

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

            <div className="md:col-span-2">
              <label className="label-text">Description</label>
              <textarea
                className="input-field min-h-28 resize-y"
                name="description"
                value={form.description}
                onChange={updateField}
                placeholder="Short purpose of this test"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <input
                type="checkbox"
                name="is_published"
                checked={form.is_published}
                onChange={updateField}
                className="h-5 w-5 rounded border-slate-300"
              />
              <span>
                <span className="block text-sm font-bold text-slate-800">
                  Publish for students
                </span>
                <span className="text-xs text-slate-500">
                  Students can attempt this test when enabled.
                </span>
              </span>
            </label>
          </div>
        </section>

        <section className="glass-card p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">Questions</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add correct answers and marks. AI will compare student answers
                against these references.
              </p>
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="btn-secondary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </button>
          </div>

          <div className="space-y-5">
            {form.questions.map((question, index) => (
              <div
                key={index}
                className="rounded-3xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      Question {index + 1}
                    </p>
                    <p className="text-xs text-slate-500">
                      Order: {question.order}
                    </p>
                  </div>

                  {form.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="inline-flex items-center rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="label-text">Question Text</label>
                    <textarea
                      className="input-field min-h-24 resize-y"
                      value={question.question_text}
                      onChange={(event) =>
                        updateQuestion(
                          index,
                          "question_text",
                          event.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label-text">Correct Answer</label>
                    <textarea
                      className="input-field min-h-20 resize-y"
                      value={question.correct_answer}
                      onChange={(event) =>
                        updateQuestion(
                          index,
                          "correct_answer",
                          event.target.value,
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="label-text">Marks</label>
                    <input
                      className="input-field"
                      type="number"
                      min="1"
                      value={question.marks}
                      onChange={(event) =>
                        updateQuestion(index, "marks", event.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="label-text">Question Difficulty</label>
                    <select
                      className="input-field"
                      value={question.difficulty}
                      onChange={(event) =>
                        updateQuestion(index, "difficulty", event.target.value)
                      }
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="sticky bottom-4 z-20 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-slate-950">
                Ready to create this test?
              </p>
              <p className="text-xs text-slate-500">
                {form.questions.length} question(s),{" "}
                {form.questions.reduce(
                  (total, question) => total + Number(question.marks || 0),
                  0,
                )}{" "}
                total marks
              </p>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary">
              <Save className="mr-2 h-4 w-4" />
              {submitting ? "Creating..." : "Create Test"}
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
