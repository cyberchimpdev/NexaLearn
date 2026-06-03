import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { sendGeminiChatMessage } from "../services/aiService";

const TutorAIContext = createContext(null);

export const buildMistakeTutorContext = (mistake) => {
  if (!mistake) return "";

  const question =
    mistake.question ||
    mistake.question_text ||
    mistake.text ||
    "No question text available";

  const studentAnswer =
    mistake.student_answer || mistake.studentAnswer || "Not available";

  const correctAnswer =
    mistake.correct_answer || mistake.correctAnswer || "Not available";

  const weakConcept =
    mistake.weak_concept ||
    mistake.weakConcept ||
    mistake.topic ||
    "General concept";

  const mistakeType =
    mistake.mistake_type || mistake.mistakeType || "concept_gap";

  const explanation =
    mistake.explanation ||
    mistake.personalized_explanation ||
    "No explanation available";

  const revisionTask =
    mistake.revision_task ||
    mistake.revisionTask ||
    "Revise the weak concept and solve 3 similar questions.";

  return `
Explain this mistake clearly.

Question:
${question}

Student answer:
${studentAnswer}

Correct answer:
${correctAnswer}

Weak concept:
${weakConcept}

Mistake type:
${mistakeType}

Existing explanation:
${explanation}

Revision task:
${revisionTask}

Give a simple class-wise explanation, interest-based example if useful, and 3 recovery steps.
`.trim();
};

export function TutorAIProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I am Tutor AI. Ask me a doubt, paste a mistake, or tell me a topic you want to understand.",
      provider: "local",
    },
  ]);

  const openTutorAI = useCallback((prompt = "") => {
    setInitialPrompt(prompt);
    setIsOpen(true);
  }, []);

  const closeTutorAI = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearTutorPrompt = useCallback(() => {
    setInitialPrompt("");
  }, []);

  const sendTutorMessage = useCallback(
    async ({
      message,
      subject = "General",
      topic = "General",
      studentClass = "12",
      learningStyle = "",
      interests = [],
    }) => {
      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
      };

      setMessages((prev) => [...prev, userMessage]);

      const data = await sendGeminiChatMessage({
        message,
        subject,
        topic,
        studentClass,
        learningStyle,
        interests,
      });

      const botText =
        data?.message ||
        data?.reply ||
        data?.answer ||
        "Tutor AI could not generate a response.";

      const botMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: botText,
        provider: data?.provider || "unknown",
      };

      setMessages((prev) => [...prev, botMessage]);

      return data;
    },
    [],
  );

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      initialPrompt,
      setInitialPrompt,
      messages,
      setMessages,
      openTutorAI,
      closeTutorAI,
      clearTutorPrompt,
      sendTutorMessage,
    }),
    [
      isOpen,
      initialPrompt,
      messages,
      openTutorAI,
      closeTutorAI,
      clearTutorPrompt,
      sendTutorMessage,
    ],
  );

  return (
    <TutorAIContext.Provider value={value}>{children}</TutorAIContext.Provider>
  );
}

export const useTutorAI = () => {
  const context = useContext(TutorAIContext);

  if (!context) {
    throw new Error("useTutorAI must be used inside TutorAIProvider");
  }

  return context;
};
