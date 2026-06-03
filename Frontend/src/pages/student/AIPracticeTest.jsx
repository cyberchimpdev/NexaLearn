import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Send,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import {
  generateStudentPracticeQuiz,
  submitAIPractice,
} from "../../services/aiService";

const INITIAL_FORM = {
  subject: "Physics",
  topic: "Electric Field",
  class_level: "12",
  difficulty: "medium",
  question_count: 5,
  marks_per_question: 2,
};

const getQuestionId = (question, index) => {
  return String(
    question?.id ??
      question?.question_id ??
      question?.order ??
      `q-${index + 1}`,
  );
};

const getQuestionOrder = (question, index) => {
  return Number(
    question?.order ?? question?.id ?? question?.question_id ?? index + 1,
  );
};

const getQuestionText = (question) => {
  return (
    question?.question_text ||
    question?.question ||
    question?.text ||
    "Question text unavailable"
  );
};

const getCorrectAnswer = (question) => {
  return (
    question?.correct_answer ||
    question?.correctAnswer ||
    question?.answer ||
    ""
  );
};

const normalizeQuestion = (question, index) => {
  const id = getQuestionId(question, index);
  const order = getQuestionOrder(question, index);
  const questionText = getQuestionText(question);

  return {
    ...question,
    id,
    order,
    question: questionText,
    question_text: questionText,
    text: questionText,
    options: Array.isArray(question?.options) ? question.options : [],
    correct_answer: getCorrectAnswer(question),
    explanation: question?.explanation || "",
    weak_concept:
      question?.weak_concept ||
      question?.weakConcept ||
      question?.topic ||
      "General",
    hint: question?.hint || "",
    subject: question?.subject || "General",
    topic: question?.topic || "General",
    class_level:
      question?.class_level ||
      question?.student_class ||
      question?.studentClass ||
      "12",
    difficulty: question?.difficulty || "medium",
    marks: Number(question?.marks || question?.mark || 1),
  };
};

const normalizeQuiz = (data, formData) => {
  const rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
  const questions = rawQuestions.map(normalizeQuestion);

  return {
    ...data,
    title: data?.title || `${formData.subject} ${formData.topic} Practice Test`,
    description:
      data?.description ||
      "Answer the questions and submit to get AI-powered feedback.",
    subject: data?.subject || formData.subject,
    topic: data?.topic || formData.topic,
    class_level:
      data?.class_level || data?.student_class || formData.class_level,
    difficulty: data?.difficulty || formData.difficulty,
    total_marks:
      data?.total_marks ||
      questions.reduce((sum, question) => sum + Number(question.marks || 1), 0),
    questions,
    source: data?.source || data?.provider || "gemini",
  };
};

function AIPracticeTest() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const answeredCount = useMemo(() => {
    if (!quiz?.questions?.length) return 0;

    return quiz.questions.filter((question, index) => {
      const questionId = getQuestionId(question, index);
      const value = answers[questionId];
      return Boolean(String(value || "").trim());
    }).length;
  }, [answers, quiz]);

  const totalQuestions = quiz?.questions?.length || 0;

  const totalMarks =
    quiz?.total_marks ||
    Number(formData.question_count) * Number(formData.marks_per_question);

  const progress =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  function updateField(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleGenerate(event) {
    event.preventDefault();

    setGenerating(true);
    setError("");
    setResult(null);
    setAnswers({});

    try {
      const data = await generateStudentPracticeQuiz({
        subject: formData.subject.trim(),
        topic: formData.topic.trim(),
        studentClass: formData.class_level.trim(),
        class_level: formData.class_level.trim(),
        grade_level: formData.class_level.trim(),
        difficulty: formData.difficulty,
        totalQuestions: Number(formData.question_count),
        question_count: Number(formData.question_count),
        count: Number(formData.question_count),
        marksPerQuestion: Number(formData.marks_per_question),
        marks_per_question: Number(formData.marks_per_question),
        interests: [],
      });

      const normalizedQuiz = normalizeQuiz(data, formData);

      if (!normalizedQuiz.questions.length) {
        setQuiz(null);
        setError("No questions were generated. Try another topic.");
        return;
      }

      setQuiz(normalizedQuiz);
    } catch (err) {
      console.error("AI practice generation failed:", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });

      const status = err?.response?.status;

      if (status === 401) {
        setError("Login token expired. Log out and log in again.");
      } else if (status === 404) {
        setError(
          "AI practice route not found. Check /api/ai/practice/generate/.",
        );
      } else if (status === 400) {
        setError("Invalid form data. Check subject, topic, class, and marks.");
      } else if (status === 500) {
        setError(
          "Backend crashed while generating quiz. Check Django terminal.",
        );
      } else {
        setError(
          err?.readableMessage ||
            "Failed to generate AI practice test. Check backend server.",
        );
      }
    } finally {
      setGenerating(false);
    }
  }

  function updateAnswer(questionId, value) {
    setAnswers((previous) => ({
      ...previous,
      [String(questionId)]: value,
    }));
  }

  async function handleSubmit() {
    if (!quiz?.questions?.length) {
      setError("Generate a practice test first.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title: quiz.title,
        subject: quiz.subject,
        topic: quiz.topic,
        studentClass: quiz.class_level,
        class_level: quiz.class_level,
        student_class: quiz.class_level,
        difficulty: quiz.difficulty,
        questions: quiz.questions,
        answers,
      };

      const data = await submitAIPractice(payload);
      setResult(normalizeResult(data));

      setTimeout(() => {
        document
          .getElementById("ai-practice-result")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      console.error("AI practice submission failed:", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });

      const status = err?.response?.status;

      if (status === 401) {
        setError("Login token expired. Log out and log in again.");
      } else if (status === 404) {
        setError("AI practice evaluation route not found.");
      } else if (status === 400) {
        setError("Invalid submission payload. Check answers and questions.");
      } else if (status === 500) {
        setError(
          "Backend crashed during AI evaluation. Check Django terminal.",
        );
      } else {
        setError(
          err?.readableMessage ||
            "Failed to submit practice test for analysis.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout role="student">
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 xl:grid-cols-[1fr_340px] xl:items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
                  <Sparkles className="h-4 w-4" />
                  AI Practice Generator
                </div>

                <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Generate a clean topic-based test.
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  Create a random practice paper from any subject and topic.
                  Submit your answers to get score, weak concepts, explanations,
                  and recovery tasks.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  label="Answered"
                  value={`${answeredCount}/${totalQuestions || 0}`}
                />
                <StatCard label="Progress" value={`${progress}%`} />
                <StatCard label="Marks" value={totalMarks} />
              </div>
            </div>

            {error ? (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                {error}
              </div>
            ) : null}

            <form
              onSubmit={handleGenerate}
              className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_0.7fr_0.8fr_0.7fr_0.7fr_150px]"
            >
              <FormInput
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={updateField}
                placeholder="Physics"
              />

              <FormInput
                label="Topic"
                name="topic"
                value={formData.topic}
                onChange={updateField}
                placeholder="Electric Field"
              />

              <FormInput
                label="Class"
                name="class_level"
                value={formData.class_level}
                onChange={updateField}
                placeholder="12"
              />

              <div>
                <label className="label-text">Difficulty</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={updateField}
                  className="input-field"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <FormInput
                label="Questions"
                name="question_count"
                type="number"
                min="1"
                max="20"
                value={formData.question_count}
                onChange={updateField}
              />

              <FormInput
                label="Marks"
                name="marks_per_question"
                type="number"
                min="1"
                max="10"
                value={formData.marks_per_question}
                onChange={updateField}
              />

              <div className="flex items-end md:col-span-2 xl:col-span-1">
                <button
                  type="submit"
                  disabled={generating}
                  className="btn-primary h-12 w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate
                </button>
              </div>
            </form>
          </section>

          {!quiz ? (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
              <BookOpenCheck className="mx-auto h-12 w-12 text-slate-300" />
              <h2 className="mt-4 text-xl font-black text-slate-950">
                No practice test generated yet
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Select subject, topic, class, difficulty, then click Generate.
              </p>
            </section>
          ) : null}

          {quiz && !result ? (
            <>
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
                  <div>
                    <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
                      Class {quiz.class_level}
                    </span>

                    <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
                      {quiz.title}
                    </h2>

                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      {quiz.subject} • {quiz.topic} • {quiz.difficulty}
                    </p>

                    <p className="mt-5 text-sm leading-7 text-slate-600">
                      {quiz.description}
                    </p>

                    {quiz.source === "local" ||
                    quiz.provider === "local" ||
                    quiz.source === "local_random_generator" ? (
                      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                        <p>
                          Gemini unavailable. Local fallback generator used.
                        </p>
                        {quiz.gemini_error ? (
                          <p className="mt-2 text-xs font-semibold text-amber-800">
                            Reason: {quiz.gemini_error}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Questions" value={quiz.questions.length} />
                    <StatCard label="Total Marks" value={quiz.total_marks} />
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                {quiz.questions.map((question, index) => {
                  const questionId = getQuestionId(question, index);

                  return (
                    <QuestionCard
                      key={questionId}
                      question={question}
                      index={index}
                      value={answers[questionId] || ""}
                      onChange={(value) => updateAnswer(questionId, value)}
                    />
                  );
                })}
              </section>

              <div className="sticky bottom-5 z-20 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-black text-white shadow-2xl shadow-indigo-600/25 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-5 w-5" />
                  )}
                  Submit AI Practice
                </button>
              </div>
            </>
          ) : null}

          {result ? (
            <PracticeResult result={result} onRetake={() => setResult(null)} />
          ) : null}
        </div>
      </main>
    </DashboardLayout>
  );
}

function normalizeResult(data) {
  const results = Array.isArray(data?.results)
    ? data.results.map((item, index) => ({
        ...item,
        order: item.order ?? item.question_id ?? index + 1,
        question_text:
          item.question_text ||
          item.question ||
          item.text ||
          "Question text unavailable",
        student_answer: item.student_answer || "Not available",
        correct_answer: item.correct_answer || "",
        score: item.score ?? item.marks_awarded ?? 0,
        marks: item.marks ?? 1,
        status: item.status || (item.is_correct ? "correct" : "incorrect"),
        mistake_type:
          item.mistake_type || (item.is_correct ? "correct" : "concept_gap"),
        weak_concept: item.weak_concept || "General",
        what_went_wrong:
          item.what_went_wrong || item.explanation || "Not available",
        easy_explanation:
          item.easy_explanation ||
          item.personalized_explanation ||
          item.explanation ||
          "Not available",
        recovery_task:
          item.recovery_task ||
          item.revision_task ||
          "Review the weak concept and solve 3 similar questions.",
        next_time_guideline:
          item.next_time_guideline ||
          item.next_question_suggestion ||
          "Practice one more similar question.",
        missing_keywords: Array.isArray(item.missing_keywords)
          ? item.missing_keywords
          : [],
      }))
    : [];

  return {
    ...data,
    title: data?.title || "AI Practice Result",
    summary:
      data?.summary ||
      data?.overall_feedback ||
      "AI evaluated your practice test and generated feedback.",
    score: data?.score ?? data?.obtained_marks ?? 0,
    total_marks: data?.total_marks ?? 0,
    percentage: data?.percentage ?? 0,
    weak_concepts: Array.isArray(data?.weak_concepts) ? data.weak_concepts : [],
    results,
  };
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function FormInput({ label, ...props }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <input className="input-field" {...props} />
    </div>
  );
}

function QuestionCard({ question, index, value, onChange }) {
  const questionText = getQuestionText(question);
  const order = getQuestionOrder(question, index);

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
          Question {order}
        </span>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
          <p className="text-xs font-bold text-slate-500">Marks</p>
          <p className="text-xl font-black text-slate-950">{question.marks}</p>
        </div>
      </div>

      <h3 className="mt-5 text-lg font-black leading-8 text-slate-950">
        {questionText}
      </h3>

      {Array.isArray(question.options) && question.options.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {question.options.map((option) => (
            <label
              key={`${order}-${option}`}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <input
                type="radio"
                name={`question-${order}`}
                value={option}
                checked={value === option}
                onChange={(event) => onChange(event.target.value)}
                className="h-4 w-4 accent-indigo-600"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      ) : null}

      <label className="mt-6 block text-sm font-bold text-slate-800">
        Your Answer
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write your answer here..."
        rows={5}
        className="mt-3 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
      />
    </article>
  );
}

function PracticeResult({ result, onRetake }) {
  return (
    <section id="ai-practice-result" className="space-y-5">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
              <ClipboardCheck className="h-4 w-4" />
              AI Practice Result
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              {result.title}
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              {result.summary}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Score"
              value={`${result.score}/${result.total_marks}`}
            />
            <StatCard label="Percent" value={`${result.percentage}%`} />
            <StatCard label="Weak" value={result.weak_concepts?.length || 0} />
          </div>
        </div>

        {result.weak_concepts?.length > 0 ? (
          <div className="mt-6 rounded-2xl bg-amber-50 p-4">
            <p className="text-sm font-black text-amber-800">Weak Concepts</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.weak_concepts.map((concept) => (
                <span
                  key={concept}
                  className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-700"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <button type="button" onClick={onRetake} className="btn-secondary mt-6">
          Back to answers
        </button>
      </div>

      {result.results?.map((item) => (
        <ResultCard key={item.order} item={item} />
      ))}
    </section>
  );
}

function ResultCard({ item }) {
  const isCorrect = item.status === "correct";

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${
              isCorrect
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {item.mistake_type}
          </div>

          <h3 className="mt-5 text-lg font-black leading-8 text-slate-950">
            Q{item.order}. {item.question_text}
          </h3>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
          <p className="text-xs font-bold text-slate-500">Score</p>
          <p className="text-xl font-black text-slate-950">
            {item.score}/{item.marks}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <InfoBox label="Your Answer" value={item.student_answer} />
        <InfoBox label="Correct Answer" value={item.correct_answer} />
        <InfoBox label="Weak Concept" value={item.weak_concept} />
        <InfoBox label="What Went Wrong" value={item.what_went_wrong} />
      </div>

      {item.missing_keywords?.length > 0 ? (
        <div className="mt-5 rounded-2xl bg-amber-50 p-4">
          <p className="text-sm font-black text-amber-800">
            Missing keywords / points
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {item.missing_keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl bg-indigo-50 p-5 text-sm leading-7 text-indigo-900">
        <p className="font-black">Easy explanation</p>
        <p className="mt-2">{item.easy_explanation}</p>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-white">
        <div className="flex items-center gap-2 font-black">
          <Target className="h-4 w-4" />
          Recovery task
        </div>
        <p className="mt-3">{item.recovery_task}</p>
        <p className="mt-3 text-slate-300">{item.next_time_guideline}</p>
      </div>
    </article>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {value || "Not available"}
      </p>
    </div>
  );
}

export default AIPracticeTest;
