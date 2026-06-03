import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Loader2,
  Plus,
  Save,
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

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "duration_minutes" ? Number(value) : value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
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
  };

  const addQuestion = () => {
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
  };

  const removeQuestion = (index) => {
    setQuestions((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter((_, questionIndex) => questionIndex !== index);
    });
  };

  const validatePayload = () => {
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
  };

  const handleSubmit = async (event) => {
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
  };

  return (
    <DashboardLayout role="teacher">
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate("/teacher")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </button>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Create Diagnostic Test
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Create a test that NexaLearn can use to detect weak concepts,
                mistake patterns, and personalized recovery tasks.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-sm">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-slate-950">
                Test Information
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="title"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Test Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Photosynthesis Diagnostic Test"
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleFormChange}
                    placeholder="e.g. Biology"
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="topic"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Topic
                  </label>
                  <input
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleFormChange}
                    placeholder="e.g. Plant Physiology"
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="grade_level"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Grade Level
                  </label>
                  <input
                    id="grade_level"
                    name="grade_level"
                    value={formData.grade_level}
                    onChange={handleFormChange}
                    placeholder="e.g. Class 12"
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="duration_minutes"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Duration Minutes
                  </label>
                  <input
                    id="duration_minutes"
                    name="duration_minutes"
                    type="number"
                    min="5"
                    value={formData.duration_minutes}
                    onChange={handleFormChange}
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder="Describe what this test checks..."
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Questions
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Add questions with correct answers so AI can analyze student
                    mistakes accurately.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
              </div>

              <div className="mt-6 space-y-5">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-sm font-bold text-slate-950">
                        Question {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        disabled={questions.length === 1}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Question Text
                        </label>
                        <textarea
                          value={question.question_text}
                          onChange={(event) =>
                            handleQuestionChange(
                              index,
                              "question_text",
                              event.target.value,
                            )
                          }
                          rows={3}
                          placeholder="Write the question..."
                          className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700">
                          Question Type
                        </label>
                        <select
                          value={question.question_type}
                          onChange={(event) =>
                            handleQuestionChange(
                              index,
                              "question_type",
                              event.target.value,
                            )
                          }
                          className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        >
                          <option value="short_answer">Short Answer</option>
                          <option value="mcq">MCQ</option>
                          <option value="long_answer">Long Answer</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700">
                          Marks
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={question.marks}
                          onChange={(event) =>
                            handleQuestionChange(
                              index,
                              "marks",
                              event.target.value,
                            )
                          }
                          className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Correct Answer
                        </label>
                        <textarea
                          value={question.correct_answer}
                          onChange={(event) =>
                            handleQuestionChange(
                              index,
                              "correct_answer",
                              event.target.value,
                            )
                          }
                          rows={3}
                          placeholder="Write the correct answer..."
                          className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Explanation / Marking Note
                        </label>
                        <textarea
                          value={question.explanation}
                          onChange={(event) =>
                            handleQuestionChange(
                              index,
                              "explanation",
                              event.target.value,
                            )
                          }
                          rows={3}
                          placeholder="Optional teacher explanation..."
                          className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Create Test
              </button>
            </div>
          </form>
        </div>
      </main>
    </DashboardLayout>
  );
}

export default CreateTest;
