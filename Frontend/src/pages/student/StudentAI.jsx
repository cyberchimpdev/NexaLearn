import { useEffect, useState } from "react";
import {
  AlertCircle,
  Bot,
  Brain,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

function StudentAI() {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([
    {
      role: "assistant",
      content:
        "Hi, I am your NexaLearn AI tutor. Ask me any study doubt, concept, mistake, or topic you want to understand.",
    },
  ]);

  const [learningProfile, setLearningProfile] = useState(null);
  const [subject, setSubject] = useState("General");
  const [topic, setTopic] = useState("General");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLearningProfile();
  }, []);

  const fetchLearningProfile = async () => {
    try {
      const response = await api.get("/personalization/profile/summary/");
      setLearningProfile(response.data);
    } catch (err) {
      setLearningProfile({
        grade_level: "General",
        learning_style: "simple",
        interests: [],
        preferred_subjects: [],
        weak_subjects: [],
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const buildPrompt = (studentMessage) => {
    const profile = learningProfile || {};

    return `
You are NexaLearn AI Tutor.

Your job:
- Explain academic concepts clearly.
- Help students understand mistakes.
- Adapt explanation to the student's profile.
- Keep the answer practical and student-friendly.

Student Profile:
Grade Level: ${profile.grade_level || "General"}
Learning Style: ${profile.learning_style || "simple"}
Interests: ${
      Array.isArray(profile.interests) && profile.interests.length > 0
        ? profile.interests.join(", ")
        : "general real-life examples"
    }
Preferred Subjects: ${
      Array.isArray(profile.preferred_subjects) &&
      profile.preferred_subjects.length > 0
        ? profile.preferred_subjects.join(", ")
        : "General"
    }
Weak Subjects: ${
      Array.isArray(profile.weak_subjects) && profile.weak_subjects.length > 0
        ? profile.weak_subjects.join(", ")
        : "General"
    }

Current Subject: ${subject}
Current Topic: ${topic}

Student Question:
${studentMessage}

Answer rules:
1. Start with a simple direct explanation.
2. Use examples connected to the student's interests when useful.
3. Avoid very long chatbot-style answers.
4. Give one short practice task at the end.
5. If the question is unclear, ask one clear follow-up question.
`;
  };

  const handleSend = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      setError("Please type your question first.");
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
        learning_profile: learningProfile,
      });

      const reply =
        response.data?.reply ||
        response.data?.response ||
        response.data?.message ||
        "I could not generate a clear response. Please try again.";

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
            "I could not connect to the AI service right now. Please check your backend server, Gemini API key, and AI route.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setConversation([
      {
        role: "assistant",
        content:
          "Chat reset. Ask me any study doubt, topic, concept, or mistake you want to understand.",
      },
    ]);
    setMessage("");
    setError("");
  };

  return (
    <DashboardLayout role="student">
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-900 p-6 text-white sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                    <Sparkles className="h-3.5 w-3.5" />
                    Personalized AI Tutor
                  </div>

                  <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                    Ask doubts from any subject
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-50">
                    NexaLearn AI explains concepts based on your class, learning
                    style, interests, weak subjects, and previous mistakes.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600">
                      <Brain className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs text-indigo-100">Learning Style</p>
                      <p className="text-sm font-semibold capitalize">
                        {profileLoading
                          ? "Loading..."
                          : learningProfile?.learning_style || "simple"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
              <aside className="border-b border-slate-100 bg-slate-50 p-5 lg:border-b-0 lg:border-r">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="subject"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Subject
                    </label>

                    <input
                      id="subject"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      placeholder="e.g. Biology"
                      className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="topic"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Topic
                    </label>

                    <input
                      id="topic"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      placeholder="e.g. Photosynthesis"
                      className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Your profile
                    </p>

                    {profileLoading ? (
                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading profile...
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3 text-sm">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Grade
                          </p>
                          <p className="mt-1 font-semibold text-slate-800">
                            {learningProfile?.grade_level || "General"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Interests
                          </p>
                          <p className="mt-1 leading-6 text-slate-700">
                            {Array.isArray(learningProfile?.interests) &&
                            learningProfile.interests.length > 0
                              ? learningProfile.interests.join(", ")
                              : "Not added yet"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Weak Subjects
                          </p>
                          <p className="mt-1 leading-6 text-slate-700">
                            {Array.isArray(learningProfile?.weak_subjects) &&
                            learningProfile.weak_subjects.length > 0
                              ? learningProfile.weak_subjects.join(", ")
                              : "Not added yet"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Chat
                  </button>
                </div>
              </aside>

              <section className="flex min-h-[620px] flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
                  {conversation.map((item, index) => (
                    <div
                      key={`${item.role}-${index}`}
                      className={`flex ${
                        item.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-[90%] gap-3 ${
                          item.role === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                            item.role === "user"
                              ? "bg-slate-900 text-white"
                              : "bg-indigo-600 text-white"
                          }`}
                        >
                          {item.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>

                        <div
                          className={`whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-6 ${
                            item.role === "user"
                              ? "bg-slate-900 text-white"
                              : "border border-slate-200 bg-slate-50 text-slate-700"
                          }`}
                        >
                          {item.content}
                        </div>
                      </div>
                    </div>
                  ))}

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
                        placeholder="Ask a doubt, concept, topic, or mistake..."
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
                      Send
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
    </DashboardLayout>
  );
}

export default StudentAI;
