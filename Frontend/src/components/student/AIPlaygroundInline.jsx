import { useState } from "react";
import {
  AlertCircle,
  Bot,
  Brain,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";

import api from "../../services/api";

export function AIPlaygroundInline({
  mistake = null,
  subject = "General",
  topic = "General",
  learningProfile = null,
}) {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const profile = learningProfile || {
    grade_level: "General",
    learning_style: "simple",
    interests: [],
  };

  const buildPrompt = (studentMessage) => {
    const mistakeContext = mistake
      ? `
Question: ${mistake.question_text || mistake.question || "N/A"}
Student Answer: ${mistake.student_answer || "N/A"}
Correct Answer: ${mistake.correct_answer || "N/A"}
Mistake Type: ${mistake.mistake_type || "N/A"}
Weak Concept: ${mistake.weak_concept || topic}
`
      : "No specific mistake context provided.";

    return `
You are NexaLearn AI Tutor.

Explain this mistake clearly for the student.

Subject: ${subject}
Topic: ${topic}
Grade Level: ${profile.grade_level || "General"}
Learning Style: ${profile.learning_style || "simple"}
Student Interests: ${
      Array.isArray(profile.interests) && profile.interests.length > 0
        ? profile.interests.join(", ")
        : "general real-life examples"
    }

Mistake Context:
${mistakeContext}

Student Doubt:
${studentMessage}

Response rules:
- Keep the explanation short and useful.
- Explain why the mistake happened.
- Explain the correct concept.
- Use the student's learning style and interests if possible.
- Give one quick practice task.
`;
  };

  const handleSend = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      setError("Please type your doubt first.");
      return;
    }

    setLoading(true);
    setError("");

    const userMessage = {
      role: "user",
      content: cleanMessage,
    };

    setConversation((previous) => [...previous, userMessage]);

    try {
      const response = await api.post("/ai/chat/", {
        message: buildPrompt(cleanMessage),
        subject,
        topic,
        learning_profile: profile,
        mistake,
      });

      const reply =
        response.data?.reply ||
        response.data?.response ||
        response.data?.message ||
        "I could not generate a clear explanation.";

      setConversation((previous) => [
        ...previous,
        {
          role: "assistant",
          content: reply,
        },
      ]);

      setMessage("");
    } catch (err) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "AI service failed. Make sure Django backend is running and /api/ai/chat/ exists.";

      setError(errorMessage);

      setConversation((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I could not connect to the AI service right now. Please check your backend server and API route.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessage("");
    setConversation([]);
    setError("");
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <Bot className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                AI Playground
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Ask AI to explain this mistake using your learning profile,
                interests, and weak concept.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Subject
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {subject || "General"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Topic
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {topic || "General"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Learning Style
            </p>
            <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
              {profile.learning_style || "simple"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[360px] space-y-4 overflow-y-auto p-5 sm:p-6">
        {conversation.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
              <Brain className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-950">
              Ask about this mistake
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Example: “Why is my answer wrong?”, “Explain this with cricket,”
              or “Give me one similar practice question.”
            </p>
          </div>
        ) : (
          conversation.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={`flex ${
                item.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[88%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-6 ${
                  item.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {item.content}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating explanation...
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-5 mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mx-6">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="border-t border-slate-100 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask AI to explain this mistake..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Ask AI
          </button>
        </div>
      </div>
    </section>
  );
}

export default AIPlaygroundInline;
