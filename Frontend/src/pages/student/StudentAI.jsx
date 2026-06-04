import { useEffect, useRef, useState } from "react";
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
  const abortControllerRef = useRef(null);
  const chatEndRef = useRef(null);

  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([
    {
      role: "assistant",
      content:
        "Answer: I am ready to help.\n\nExplanation: Ask any study question, topic, formula, programming concept, or exam doubt. I will give the direct answer first, then explain it simply.",
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

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, loading]);

  async function fetchLearningProfile() {
    try {
      const response = await api.get("/personalization/profile/summary/");
      setLearningProfile(response.data);
    } catch {
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
  }

  function buildRecentContext(items) {
    return items
      .slice(-5)
      .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
      .join("\n\n");
  }

  async function handleSend() {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      setError("Please type your question first.");
      return;
    }

    if (loading) return;

    setLoading(true);
    setError("");

    const userMessage = {
      role: "user",
      content: cleanMessage,
    };

    const nextConversation = [...conversation, userMessage];

    setConversation(nextConversation);
    setMessage("");

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await api.post(
        "/ai/chat/",
        {
          message: cleanMessage,
          context: [
            buildRecentContext(nextConversation),
            `Selected subject: ${subject || "General"}`,
            `Selected topic: ${topic || "General"}`,
            "Answer the exact user question only.",
            "Give the direct final answer first.",
            "Then explain simply with steps if needed.",
            "Do not switch to a random topic.",
            "Avoid markdown symbols like ** or ##.",
          ].join("\n\n"),
          subject: subject || "General",
          topic: topic || "General",
          learning_profile: learningProfile || {},
        },
        {
          signal: abortControllerRef.current.signal,
          timeout: 30000,
        },
      );

      const reply =
        response.data?.reply ||
        response.data?.message ||
        response.data?.answer ||
        getLocalStudyFallback(cleanMessage, subject, topic);

      setConversation((previous) => [
        ...previous,
        {
          role: "assistant",
          content: cleanMarkdownText(reply),
        },
      ]);

      if (response.data?.debug_error) {
        console.warn("NexaLearn AI debug:", response.data.debug_error);
      }
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        return;
      }

      setConversation((previous) => [
        ...previous,
        {
          role: "assistant",
          content: getLocalStudyFallback(cleanMessage, subject, topic),
        },
      ]);

      setError(
        "Gemini may be temporarily limited. Showing NexaLearn local study support instead.",
      );
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }

  function handleReset() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setConversation([
      {
        role: "assistant",
        content:
          "Answer: Chat reset.\n\nExplanation: Ask any study question, topic, formula, programming concept, or exam doubt. I will answer directly and explain simply.",
      },
    ]);

    setMessage("");
    setError("");
    setLoading(false);
  }

  return (
    <DashboardLayout title="NexaLearn AI">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_52%,#22c55e_100%)] p-6 text-white shadow-xl shadow-sky-500/15 sm:p-8">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur">
                <Sparkles className="h-4 w-4" />
                NexaLearn Study AI
              </div>

              <h1 className="mt-6 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                Ask doubts and understand concepts in your own way.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-sky-50 sm:text-base">
                Get direct answers, simple explanations, step-by-step reasoning,
                and examples based on your selected subject, topic, and learning
                profile.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-700">
                  <Brain className="h-7 w-7" />
                </div>

                <div>
                  <p className="text-sm font-bold text-sky-100">Tutor Mode</p>
                  <h2 className="mt-1 text-xl font-black text-white">
                    {profileLoading
                      ? "Loading profile..."
                      : learningProfile?.learning_style || "Simple"}
                  </h2>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-sky-50">
                Class: {learningProfile?.grade_level || "General"} • Subject:{" "}
                {subject || "General"} • Topic: {topic || "General"}
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[340px_1fr]">
            <aside className="border-b border-slate-100 bg-slate-50/70 p-5 lg:border-b-0 lg:border-r lg:border-slate-100">
              <div className="space-y-4">
                <Field
                  label="Subject"
                  value={subject}
                  onChange={setSubject}
                  placeholder="e.g. Physics, CS, SAT English"
                />

                <Field
                  label="Topic"
                  value={topic}
                  onChange={setTopic}
                  placeholder="e.g. Electric Field, Agile Model"
                />

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-black text-slate-900">
                    Your profile
                  </p>

                  {profileLoading ? (
                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                      Loading profile...
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3 text-sm">
                      <ProfileItem
                        label="Grade"
                        value={learningProfile?.grade_level || "General"}
                      />

                      <ProfileItem
                        label="Learning Style"
                        value={learningProfile?.learning_style || "Simple"}
                      />

                      <ProfileItem
                        label="Interests"
                        value={formatProfileValue(learningProfile?.interests)}
                      />

                      <ProfileItem
                        label="Weak Subjects"
                        value={formatProfileValue(
                          learningProfile?.weak_subjects,
                        )}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Chat
                </button>

                {error ? (
                  <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold leading-5 text-amber-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                ) : null}
              </div>
            </aside>

            <section className="flex h-[calc(100vh-220px)] min-h-[620px] flex-col bg-white">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
                {conversation.map((item, index) => (
                  <ChatBubble
                    key={`${item.role}-${index}`}
                    role={item.role}
                    content={item.content}
                  />
                ))}

                {loading ? (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                      Generating answer...
                    </div>
                  </div>
                ) : null}

                <div ref={chatEndRef} />
              </div>

              <div className="border-t border-slate-100 bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />

                    <input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Paste any study question..."
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={loading || !message.trim()}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)] px-5 text-sm font-black text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
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
    </DashboardLayout>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-black text-slate-800">{label}</label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
      />
    </div>
  );
}

function ChatBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[92%] gap-3 ${isUser ? "flex-row-reverse" : ""}`}
      >
        <div
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm",
            isUser
              ? "bg-slate-950"
              : "bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#22c55e_100%)]",
          ].join(" ")}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        <div
          className={[
            "whitespace-pre-wrap break-words rounded-3xl px-4 py-3 text-sm leading-7",
            isUser
              ? "bg-slate-950 text-white"
              : "border border-slate-200 bg-slate-50 text-slate-700",
          ].join(" ")}
        >
          {content}
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function formatProfileValue(value) {
  if (Array.isArray(value) && value.length > 0) {
    return value.join(", ");
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return "Not added yet";
}

function cleanMarkdownText(text) {
  if (!text) return "";

  return String(text)
    .replace(/\*\*/g, "")
    .replace(/#{1,6}\s?/g, "")
    .trim();
}

function getLocalStudyFallback(question, subject, topic) {
  const text = question.toLowerCase();

  if (text.includes("electric field")) {
    return [
      "Answer: Electric field is the force experienced by a unit positive charge placed at a point.",
      "",
      "Formula:",
      "E = F / q",
      "",
      "Unit:",
      "N/C or V/m",
      "",
      "Example:",
      "If a charge experiences a force of 10 N and the charge is 2 C, then E = 10 / 2 = 5 N/C.",
      "",
      "Next step:",
      "Learn electric field lines, direction of field, and numerical problems using E = F / q.",
    ].join("\n");
  }

  if (text.includes("agile") && text.includes("spiral")) {
    return [
      "Answer: Agile and Spiral are software development models.",
      "",
      "Agile model:",
      "Agile develops software in small repeated cycles called sprints. It focuses on quick feedback and continuous improvement.",
      "",
      "Spiral model:",
      "Spiral develops software in repeated loops, but each loop includes risk analysis. It is useful for large and risky projects.",
      "",
      "Example:",
      "For a learning app, Agile builds features step by step. Spiral first checks risks like security, cost, and system failure before each stage.",
      "",
      "Next step:",
      "Remember: Agile = feedback-focused. Spiral = risk-focused.",
    ].join("\n");
  }

  if (text.includes("agile")) {
    return [
      "Answer: Agile model is a software development approach where software is built in small repeated cycles called sprints.",
      "",
      "Easy explanation:",
      "The team builds a small feature, gets feedback, improves it, and continues.",
      "",
      "Example:",
      "In NexaLearn, a team may build login first, then test creation, then reports, then AI chatbot.",
      "",
      "Next step:",
      "Learn sprint, backlog, scrum, product owner, and iteration.",
    ].join("\n");
  }

  return [
    "Answer: Gemini is temporarily limited, so I am using local support.",
    "",
    "Explanation:",
    "Your question is valid, but Gemini quota may be exhausted right now.",
    "",
    "What you can do:",
    "Try again later, use another Gemini API key/project, or ask a common topic like electric field, Agile model, Spiral model, chemical bonding, DBMS, OS, React, or Django.",
    "",
    `Current context: ${subject || "General"} - ${topic || "General"}`,
  ].join("\n");
}

export default StudentAI;
