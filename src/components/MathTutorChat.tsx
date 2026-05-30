import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, BookOpen, UserCheck, RefreshCw, Trash2, HelpCircle } from "lucide-react";
import { ChatTurn } from "../types";

export default function MathTutorChat() {
  const [inputText, setInputText] = useState("");
  const [chatLog, setChatLog] = useState<ChatTurn[]>([
    {
      id: "turn-initial",
      sender: "assistant",
      text: "Hello! I am your AI Mathematics Tutor, powered by Google Gemini. Or standard counting tables, multiplications, algebraic formula definitions, let's learn together! Ask me any math question.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isLoading]);

  // Handle send message
  const handleSendMessage = async (textToSend?: string) => {
    const rawMsg = textToSend || inputText;
    if (!rawMsg.trim()) return;

    if (!textToSend) setInputText("");

    const userTurnObj: ChatTurn = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: rawMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLog((prev) => [...prev, userTurnObj]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: rawMsg,
          history: chatLog.slice(-10) // feed latest 10 messages context
        })
      });

      if (!response.ok) {
        throw new Error("Unable to communicate with AI Tutor.");
      }

      const data = await response.json();
      const tutorTurnObj: ChatTurn = {
        id: `ttr-${Date.now()}`,
        sender: "assistant",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatLog((prev) => [...prev, tutorTurnObj]);
    } catch (err: any) {
      setChatLog((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: `Oh, I ran into an error while analyzing that problem: ${err.message || 'Check your internet connection.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setChatLog([
      {
        id: "turn-initial-cleared",
        sender: "assistant",
        text: "Let's explore another math topic! What algebraic identities or trigonometric ratios can I clarify?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const QUICK_CHIPS = [
    { label: "Factor x² - 9", request: "Explain how to factorize x^2 - 9 using algebraic identities." },
    { label: "Pythagorean visual Proof", request: "Explain the visual geometric proof for the Pythagorean theorem." },
    { label: "Simplifying 3/4 + 5/6", request: "Explain step by step how to add and simplify 3/4 + 5/6." },
    { label: "Is sine(2x) always double?", request: "Explain the double-angle formula sin(2x) with a simple example." }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[520px]" id="math-tutor-chat-frame">
      {/* Thread Header */}
      <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
            M
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1">
              AI Mathematics Tutor
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-slate-400">Pedagogical chat on formula systems & calculations</p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Clear thread history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {chatLog.map((turn) => {
          const isUser = turn.sender === "user";
          return (
            <div
              key={turn.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-indigo-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                  AI
                </div>
              )}
              <div className="space-y-1">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
                    isUser
                      ? "bg-slate-800 text-slate-50 font-medium rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-none whitespace-pre-wrap"
                  }`}
                >
                  {turn.text}
                </div>
                <span className="text-[9px] text-slate-400 block text-right px-1">{turn.timestamp}</span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-7 h-7 rounded-full bg-indigo-500 text-white font-black text-[10px] flex items-center justify-center shrink-0 animate-pulse">
              AI
            </div>
            <div className="bg-white border border-slate-100 p-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <span className="text-xs text-slate-500 font-sans italic">Tutor is solving calculations...</span>
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
            </div>
          </div>
        )}
        <div ref={threadEndRef}></div>
      </div>

      {/* Prompt Fast Chips */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100/60 overflow-x-auto whitespace-nowrap flex gap-2 scrollbar-none">
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.request)}
            disabled={isLoading}
            className="inline-block px-3 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-[10px] font-semibold text-slate-600 rounded-full border border-slate-200/80 transition-colors shadow-2xs whitespace-nowrap cursor-pointer disabled:opacity-40"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input panel */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Type mathematical formula rules, questions..."
            className="flex-1 px-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 disabled:opacity-60 font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-sm transition-all disabled:opacity-40 flex items-center justify-center shrink-0 w-9 h-9 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
