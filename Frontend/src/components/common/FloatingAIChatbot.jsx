import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { sendTutorAIMessage } from "../../services/aiService";

const starterPrompts = [
  "Explain my weak concept simply",
  "Give me 5 practice questions",
  "Explain this using cricket",
];

const FloatingAIChatbot = ({ context = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I am Tutor AI. Ask me a doubt, or tell me a topic you want to understand.",
    },
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = async (customMessage) => {
    const finalMessage = String(customMessage || message).trim();

    if (!finalMessage || isSending) return;

    const userMessage = {
      role: "user",
      content: finalMessage,
    };

    setMessages((previous) => [...previous, userMessage]);
    setMessage("");
    setIsSending(true);

    try {
      const data = await sendTutorAIMessage({
        message: finalMessage,
        context: {
          source: "floating_chatbot",
          ...context,
        },
      });

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.reply || "I could not generate a response.",
        },
      ]);
    } catch (error) {
      const backendError =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Please check backend server, login token, Gemini API key, and CORS.";

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: `Tutor AI is unavailable right now. ${backendError}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 transition hover:-translate-y-1 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
        aria-label="Open Tutor AI"
      >
        <Bot className="h-6 w-6" />
      </button>

      {isOpen && (
        <section className="fixed bottom-24 right-4 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">Tutor AI</h2>
                <p className="text-xs text-slate-500">
                  Mistake-aware learning assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              aria-label="Close Tutor AI"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="border-b border-slate-100 bg-white px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-white px-4 py-4">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`flex ${
                  item.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[84%] rounded-2xl px-4 py-2 text-sm leading-6 ${
                    item.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {item.role === "assistant" && (
                    <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-indigo-600">
                      <Sparkles className="h-3 w-3" />
                      Tutor AI
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{item.content}</p>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <footer className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSend();
                  }
                }}
                placeholder="Ask your doubt..."
                className="h-11 flex-1 rounded-2xl border border-slate-300 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={isSending || !message.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </footer>
        </section>
      )}
    </>
  );
};

export default FloatingAIChatbot;
