import { useState } from "react";
import { WordCloudItem } from "../types";
import { MessageSquare, Search, ThumbsUp, ThumbsDown } from "lucide-react";

interface WordCloudProps {
  words: WordCloudItem[];
  onWordClick?: (word: string) => void;
}

export default function WordCloud({ words, onWordClick }: WordCloudProps) {
  const [activeTab, setActiveTab] = useState<"all" | "praises" | "complaints">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWords = words
    .filter((w) => {
      if (activeTab === "praises") return w.sentiment === "positive";
      if (activeTab === "complaints") return w.sentiment === "negative";
      return true;
    })
    .filter((w) => w.text.toLowerCase().includes(searchTerm.toLowerCase()));

  // Map 1-10 weights to Tailwind text sizes
  const sizeClasses = [
    "text-xs px-2 py-1",                   // weight 1
    "text-xs px-2.5 py-1.5",               // weight 2
    "text-sm px-3 py-1.5",                 // weight 3
    "text-sm sm:text-base px-3.5 py-2",    // weight 4
    "text-base px-3.5 py-2",               // weight 5
    "text-base sm:text-lg px-4 py-2",      // weight 6
    "text-lg sm:text-xl px-4.5 py-2.5",    // weight 7
    "text-xl sm:text-2xl px-5 py-2.5 font-semibold", // weight 8
    "text-2xl sm:text-3xl px-5.5 py-3 font-semibold", // weight 9
    "text-3xl sm:text-4xl px-6 py-3.5 font-bold tracking-tight", // weight 10
  ];

  const getStyleClasses = (item: WordCloudItem) => {
    // Standardized indices
    const weightIndex = Math.min(Math.max(Math.round(item.weight) - 1, 0), sizeClasses.length - 1);
    const sizeClass = sizeClasses[weightIndex];

    let colorClass = "";
    if (item.sentiment === "positive") {
      colorClass = "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:text-emerald-800 hover:border-emerald-200 hover:shadow-sm hover:shadow-emerald-100";
    } else if (item.sentiment === "negative") {
      colorClass = "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100 hover:text-rose-800 hover:border-rose-200 hover:shadow-sm hover:shadow-rose-100";
    } else {
      colorClass = "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300 hover:shadow-sm hover:shadow-slate-100";
    }

    return `${sizeClass} ${colorClass} border rounded-2xl transition-all cursor-pointer inline-flex items-center gap-1.5 duration-200 select-none`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full justify-between">
      {/* Header & Tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Keyword Word Cloud</h3>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-48 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 mb-6 bg-slate-100/80 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All Keywords ({words.length})
          </button>
          <button
            onClick={() => setActiveTab("praises")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "praises"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-emerald-600"
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            Praises ({words.filter((w) => w.sentiment === "positive").length})
          </button>
          <button
            onClick={() => setActiveTab("complaints")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "complaints"
                ? "bg-white text-rose-700 shadow-sm"
                : "text-slate-500 hover:text-rose-600"
            }`}
          >
            <ThumbsDown className="w-3 h-3" />
            Complaints ({words.filter((w) => w.sentiment === "negative").length})
          </button>
        </div>

        {/* Cloud Area */}
        <div className="min-h-[220px] max-h-[380px] overflow-y-auto border border-slate-50 rounded-xl bg-slate-50/20 p-5 flex flex-wrap gap-2.5 items-center justify-center content-center">
          {filteredWords.length === 0 ? (
            <div className="text-center py-12 w-full text-slate-400 text-sm">
              No matching keywords found in this filter.
            </div>
          ) : (
            filteredWords.map((item, index) => (
              <button
                key={`${item.text}-${index}`}
                onClick={() => onWordClick?.(item.text)}
                title={`Click to ask Advisor about "${item.text}" (Weight: ${item.weight}/10)`}
                className={getStyleClasses(item)}
              >
                {item.text}
                <span className="text-[9px] font-mono opacity-60 ml-0.5 bg-black/5 rounded px-1">
                  {item.weight}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Cloud Legend */}
      <div className="flex justify-between items-center mt-4 border-t border-slate-200 pt-4 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Positive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Negative
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            Neutral
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 select-none">
          Click words to query
        </span>
      </div>
    </div>
  );
}
