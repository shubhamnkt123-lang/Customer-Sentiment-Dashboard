import React, { useState, useRef, useEffect } from "react";
import { Message, AnalysisResult } from "../types";
import { MessageSquare, Send, Sparkles, User, HelpCircle, ArrowRight } from "lucide-react";

interface AdvisorChatProps {
  analysis: AnalysisResult;
  rawReviews: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const CHAT_SUGGESTIONS = [
  "Draft a response template to negative reviews",
  "How can we address the highest-impact improvement area?",
  "What features should we market based on praises?",
  "Analyze pricing complaints in detail"
];

export default function AdvisorChat({
  analysis,
  rawReviews,
  messages,
  setMessages,
}: AdvisorChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isSending) return;

    // 1. Append user message locally
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputValue("");
    setIsSending(true);

    try {
      // 2. Query server chat endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          analysisContext: analysis,
          rawReviews,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Advisor.");
      }

      const data = await response.json();

      // 3. Append model message locally
      const modelMsg: Message = {
        id: crypto.randomUUID(),
        role: "model",
        content: data.text || "I was unable to process that. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "model",
        content: "Sorry, I ran into an error connecting to the server. Please check your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
      {/* Panel Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Sentiment Advisor Chat
            </h3>
            <p className="text-[11px] text-slate-400">Ask strategic questions about customer feedback</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-full uppercase tracking-wider select-none">
          <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
          Gemini 3.5 Active
        </span>
      </div>

      {/* Messages Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? "bg-slate-100 text-slate-600"
                    : "bg-indigo-600 text-indigo-50"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-slate-400 block mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isSending && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-indigo-50 shrink-0 flex items-center justify-center text-xs font-bold">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && !isSending && (
        <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/20">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Try asking one of these:
          </p>
          <div className="flex flex-wrap gap-2">
            {CHAT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSend(suggestion)}
                className="text-[11px] text-slate-600 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-all shadow-sm text-left flex items-center gap-1"
              >
                <span>{suggestion}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleFormSubmit} className="p-4 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl">
        <div className="relative flex items-center bg-white border border-slate-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 shadow-sm transition-all overflow-hidden pr-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your strategic analysis question..."
            disabled={isSending}
            className="w-full pl-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none placeholder:text-slate-400 border-0"
          />
          <button
            type="submit"
            disabled={isSending || !inputValue.trim()}
            className={`p-2 rounded-lg transition-all ${
              inputValue.trim() && !isSending
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                : "text-slate-300 bg-slate-50 cursor-not-allowed"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
