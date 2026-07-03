import React from "react";
import { TopicModelItem } from "../types";
import { Tag, Quote, MessageSquare, ThumbsUp } from "lucide-react";

interface TopicModelingProps {
  topics: TopicModelItem[];
}

export default function TopicModeling({ topics }: TopicModelingProps) {
  if (!topics || topics.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Tag className="w-10 h-10 text-slate-300 mb-2 animate-pulse" />
        <p className="text-sm text-slate-400">No topic models extracted yet. Complete an analysis to see topics.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Topic Modeling & Sentiment</h2>
              <p className="text-xs text-slate-400">AI-categorized themes and their specific satisfaction index</p>
            </div>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            {topics.length} Key Topics
          </span>
        </div>

        {/* Topics Grid/List */}
        <div className="space-y-6">
          {topics.map((topic) => {
            const hasSentiment = 
              topic.positivePercentage > 0 || 
              topic.neutralPercentage > 0 || 
              topic.negativePercentage > 0;

            return (
              <div 
                key={topic.name} 
                className="group border border-slate-100 rounded-xl p-5 hover:border-slate-200 hover:shadow-sm transition-all duration-200"
              >
                {/* Topic Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                    <h3 className="text-sm font-semibold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {topic.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-500">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {topic.count} mentions
                    </span>
                  </div>
                </div>

                {/* Sentiment Segment Bar */}
                {hasSentiment ? (
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1 px-0.5">
                      <span className="text-emerald-600 font-medium">{topic.positivePercentage}% Pos</span>
                      <span className="text-slate-500 font-medium">{topic.neutralPercentage}% Neu</span>
                      <span className="text-rose-600 font-medium">{topic.negativePercentage}% Neg</span>
                    </div>
                    
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                      {topic.positivePercentage > 0 && (
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500" 
                          style={{ width: `${topic.positivePercentage}%` }}
                          title={`Positive: ${topic.positivePercentage}%`}
                        />
                      )}
                      {topic.neutralPercentage > 0 && (
                        <div 
                          className="bg-slate-300 h-full transition-all duration-500" 
                          style={{ width: `${topic.neutralPercentage}%` }}
                          title={`Neutral: ${topic.neutralPercentage}%`}
                        />
                      )}
                      {topic.negativePercentage > 0 && (
                        <div 
                          className="bg-rose-400 h-full transition-all duration-500" 
                          style={{ width: `${topic.negativePercentage}%` }}
                          title={`Negative: ${topic.negativePercentage}%`}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full bg-slate-100 h-2 rounded-full mb-4 animate-pulse" />
                )}

                {/* Representative Sample Quote */}
                {topic.keyFeedbackSample && (
                  <div className="bg-slate-50/70 border-l-2 border-slate-200 rounded-r-lg p-3 text-xs text-slate-500 italic relative overflow-hidden">
                    <Quote className="w-12 h-12 text-slate-200/40 absolute -right-2 -bottom-2 pointer-events-none" />
                    <p className="line-clamp-2 relative z-10 font-normal leading-relaxed pr-6">
                      &ldquo;{topic.keyFeedbackSample}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-6 text-[11px] text-slate-400 flex items-center gap-1.5 justify-end">
        <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
        <span>Categorization and distribution computed instantly by Gemini Semantic Modeler</span>
      </div>
    </div>
  );
}
