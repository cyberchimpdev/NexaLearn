import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  Maximize2,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { sendGeminiChatMessage } from "../../services/aiService";

const QUICK_PROMPTS = [
  "Explain my weak concept simply",
  "Give me 5 practice questions",
  "Explain with real-life example",
];

function TutorAIWidget({
  profile = {},
  defaultSubject = "General",
  defaultTopic = "General",
}) {
  const messagesEndRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState(defaultSubject || "General");
  const [topic, setTopic] = useState(defaultTopic || "General");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I am Tutor AI. Ask me any study doubt, subject topic, programming concept, or exam question.",
    },
  ]);

  useEffect(() => {
    setSubject(defaultSubject || "General");
    setTopic(defaultTopic || "General");
  }, [defaultSubject, defaultTopic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(customMessage = "") {
    const question = (customMessage || input).trim();

    if (!question || loading) return;

    const currentSubject = subject.trim() || "General";
    const currentTopic = topic.trim() || "General";

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: question,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const data = await sendGeminiChatMessage({
        message: question,
        subject: currentSubject,
        topic: currentTopic,
        context: [
          `Selected subject: ${currentSubject}`,
          `Selected topic: ${currentTopic}`,
          "Answer the exact user question only.",
          "If Gemini quota fails, return useful local fallback from backend.",
        ].join(". "),
        learning_profile: {
          grade_level:
            profile?.grade_level ||
            profile?.grade ||
            profile?.class_level ||
            "General",
          learning_style: profile?.learning_style || "short and clear",
          interests: normalizeProfileValue(profile?.interests),
          weak_subjects: normalizeProfileValue(profile?.weak_subjects),
          preferred_subjects: normalizeProfileValue(
            profile?.preferred_subjects,
          ),
        },
      });

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data?.reply ||
            getClientFallback(question, currentSubject, currentTopic),
        },
      ]);

      if (data?.debug_error) {
        console.warn("Tutor AI debug:", data.debug_error);
      }
    } catch (error) {
      console.error("Tutor AI request failed:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: getClientFallback(question, currentSubject, currentTopic),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  function resetChat() {
    setMessages([
      {
        role: "assistant",
        content:
          "Chat reset. Ask me any study doubt, topic, subject, or exam question.",
      },
    ]);
    setInput("");
  }

  const panelSize = isExpanded
    ? "h-[620px] w-[min(92vw,720px)]"
    : "h-[560px] w-[min(92vw,380px)]";

  return (
    <>
      {isOpen && (
        <section
          className={[
            "fixed bottom-24 right-4 z-40 flex flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 sm:right-6",
            panelSize,
          ].join(" ")}
        >
          <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
                <Bot className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-sm font-black text-slate-950">
                  Tutor AI
                </h2>
                <p className="truncate text-xs font-medium text-slate-500">
                  Mistake-aware learning assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded((value) => !value)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                aria-label="Expand Tutor AI"
              >
                <Maximize2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                aria-label="Close Tutor AI"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Subject"
                className="h-10 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />

              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Topic"
                className="h-10 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-5">
            {messages.map((message, index) => (
              <MessageBubble
                key={`${message.role}-${index}`}
                role={message.role}
                content={message.content}
              />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  Tutor AI is thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask your doubt..."
                rows={1}
                className="max-h-24 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={resetChat}
              className="mt-2 text-xs font-bold text-slate-400 transition hover:text-slate-700"
            >
              Reset conversation
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 transition hover:-translate-y-1 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
        aria-label={isOpen ? "Close Tutor AI" : "Open Tutor AI"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}

        {!isOpen && (
          <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black text-white ring-2 ring-white">
            AI
          </span>
        )}
      </button>
    </>
  );
}

function MessageBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm",
          isUser
            ? "bg-indigo-600 text-white"
            : "border border-slate-200 bg-white text-slate-700",
        ].join(" ")}
      >
        {!isUser && (
          <div className="mb-1 flex items-center gap-1.5 text-xs font-black text-indigo-600">
            <Sparkles className="h-3.5 w-3.5" />
            Tutor AI
          </div>
        )}

        <div className="whitespace-pre-wrap break-words">{content}</div>
      </div>
    </div>
  );
}

function normalizeProfileValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return "";
}

function getClientFallback(question, subject, topic) {
  const text = question.toLowerCase();

  if (text.includes("computer architecture")) {
    return [
      "**Direct answer:**",
      "Computer architecture is the design and organization of a computer system, including CPU, memory, input/output, and instruction execution.",
      "",
      "**Easy explanation:**",
      "It explains how hardware parts work together to run programs.",
      "",
      "**Main parts:**",
      "1. CPU",
      "2. ALU",
      "3. Control Unit",
      "4. Registers",
      "5. Cache",
      "6. RAM",
      "7. Input/output devices",
      "",
      "**Example:**",
      "When you open an app, the CPU fetches instructions from memory, decodes them, and executes them.",
      "",
      "**Next step:**",
      "Learn the instruction cycle: fetch → decode → execute.",
    ].join("\n");
  }

  if (text.includes("electric field")) {
    return [
      "**Direct answer:**",
      "Electric field is the force experienced by a unit positive charge placed at a point.",
      "",
      "**Formula:**",
      "E = F/q",
      "",
      "**Unit:**",
      "N/C or V/m",
      "",
      "**Example:**",
      "If force = 10 N and charge = 2 C, then E = 10/2 = 5 N/C.",
      "",
      "**Next step:**",
      "Practice electric field numericals using E = F/q.",
    ].join("\n");
  }

  if (text.includes("agile") && text.includes("spiral")) {
    return [
      "**Direct answer:**",
      "Agile and Spiral are software development models.",
      "",
      "**Agile:**",
      "Agile builds software in small repeated cycles called sprints. It focuses on feedback and flexibility.",
      "",
      "**Spiral:**",
      "Spiral builds software in repeated loops with risk analysis in each loop.",
      "",
      "**Example:**",
      "Agile builds features step by step. Spiral checks risks before each stage.",
      "",
      "**Next step:**",
      "Remember: Agile = feedback-focused. Spiral = risk-focused.",
    ].join("\n");
  }

  return [
    "**Tutor AI fallback:**",
    "Gemini may be temporarily limited, but your question is valid.",
    "",
    `Subject: ${subject || "General"}`,
    `Topic: ${topic || "General"}`,
    "",
    "**Next step:**",
    "Ask the topic more specifically, for example: `Explain computer architecture with example.`",
  ].join("\n");
}

export default TutorAIWidget;
