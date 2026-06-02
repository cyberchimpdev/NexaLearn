import { useEffect, useRef, useState } from "react";
import {
  Bot,
  ChevronDown,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { sendGeminiChatMessage } from "../../services/aiService";

export function FloatingAIChatbot() {
  const chatBodyRef = useRef(null);
  const [open, setOpen] = useState(false);

  const [context, setContext] = useState({
    class_level: "12",
    subject: "Physics",
    topic: "Electric Field",
    student_interest: "cricket",
    explanation_style: "exam_focused",
  });

  const [message, setMessage] = useState(
    "Explain electric field using cricket example.",
  );

  const [chat, setChat] = useState([
    {
      role: "assistant",
      content:
        "Hi, I am NexaLearn AI. Ask me any concept and I will explain it based on your class and interest.",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateContext(event) {
    const { name, value } = event.target;
    setContext((previous) => ({ ...previous, [name]: value }));
  }

  function scrollToBottom() {
    if (!chatBodyRef.current) return;

    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    if (open) {
      setTimeout(scrollToBottom, 80);
    }
  }, [chat, open]);

  async function handleSend(event) {
    event.preventDefault();

    if (!message.trim()) return;

    const currentMessage = message.trim();

    setChat((previous) => [
      ...previous,
      {
        role: "user",
        content: currentMessage,
      },
    ]);

    setMessage("");
    setLoading(true);
    setError("");

    try {
      const data = await sendGeminiChatMessage({
        ...context,
        message: currentMessage,
      });

      setChat((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "AI chatbot failed. Check backend Gemini API setup.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <section className="fixed bottom-20 right-4 z-50 flex h-[440px] w-[calc(100vw-2rem)] max-w-[320px] flex-col overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-float sm:right-6">
          <header className="bg-gradient-to-br from-slate-950 to-slate-800 px-4 py-3 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-600">
                  <Bot className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black">NexaLearn AI</h2>
                  <p className="truncate text-[11px] text-slate-300">
                    Study support assistant
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Close chatbot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Chat Context
                </span>
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </summary>

              <div className="mt-3 grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <SmallInput
                    label="Class"
                    name="class_level"
                    value={context.class_level}
                    onChange={updateContext}
                  />

                  <SmallInput
                    label="Subject"
                    name="subject"
                    value={context.subject}
                    onChange={updateContext}
                  />
                </div>

                <SmallInput
                  label="Topic"
                  name="topic"
                  value={context.topic}
                  onChange={updateContext}
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-500">
                      Interest
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      name="student_interest"
                      value={context.student_interest}
                      onChange={updateContext}
                    >
                      <option value="anime">Anime</option>
                      <option value="cricket">Cricket</option>
                      <option value="gaming">Gaming</option>
                      <option value="movies">Movies</option>
                      <option value="real_life">Real Life</option>
                      <option value="textbook">Textbook</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-500">
                      Style
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      name="explanation_style"
                      value={context.explanation_style}
                      onChange={updateContext}
                    >
                      <option value="simple">Simple</option>
                      <option value="exam_focused">Exam</option>
                      <option value="step_by_step">Steps</option>
                      <option value="story_based">Story</option>
                    </select>
                  </div>
                </div>
              </div>
            </details>
          </div>

          <div
            ref={chatBodyRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-4"
          >
            {chat.map((item, index) => (
              <div
                key={index}
                className={[
                  "flex",
                  item.role === "user" ? "justify-end" : "justify-start",
                ].join(" ")}
              >
                <div
                  className={[
                    "max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs leading-6",
                    item.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                      : "bg-white text-slate-700 shadow-sm",
                  ].join(" ")}
                >
                  <p className="whitespace-pre-line">{item.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="inline-flex rounded-2xl bg-white px-3.5 py-2.5 text-xs font-bold text-slate-500 shadow-sm">
                AI is thinking...
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="border-t border-slate-200 bg-white p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                className="max-h-20 min-h-10 flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask anything..."
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend(event);
                  }
                }}
              />

              <button
                type="submit"
                disabled={loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 transition hover:scale-105 disabled:opacity-60"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-600/30 transition hover:-translate-y-1 hover:shadow-blue-600/40 sm:right-6"
        aria-label="Open AI chatbot"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}

        {!open && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black text-white ring-2 ring-white">
            AI
          </span>
        )}
      </button>
    </>
  );
}

function SmallInput({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold text-slate-500">
        {label}
      </label>
      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        {...props}
      />
    </div>
  );
}
