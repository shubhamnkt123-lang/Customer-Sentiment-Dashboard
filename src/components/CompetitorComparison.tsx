import React, { useState } from "react";
import { CompetitorAnalysis, AnalysisResult } from "../types";
import { 
  GitCompare, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  ArrowUpRight, 
  TrendingUp, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Award,
  BookOpen
} from "lucide-react";

interface CompetitorComparisonProps {
  myAnalysis: AnalysisResult | null;
}

const PRESET_COMPETITORS = [
  {
    name: "InsightFlow AI",
    reviews: `Their user interface is very slick, but the platform experiences severe latency spikes during peak hours.
I spent 4 hours trying to integrate their Webhook API only to find out it is not supported on the standard plan.
The customer support agent was extremely helpful and resolved our issue within 10 minutes.
I love the auto-tagging feature, it is incredibly accurate! But the subscription price doubled this month, which is hard to justify.
The mobile app of InsightFlow is perfect. So smooth and fast compared to others.
Frequent app crashes during PDF export make it unusable for professional presentations. Good features but reliability is questionable.`
  },
  {
    name: "AeroTrack CRM",
    reviews: `AeroTrack is super cheap, but you definitely get what you pay for. The interface is dated and looks like it was built in 2012.
Customer support took 5 days to respond to my urgent billing issue. Absolutely terrible response times.
I tried uploading a small CSV of 50 reviews and the system kept throwing timeout errors.
However, their offline desktop client works perfectly. I can edit reports and keep work going without any internet connection.
It lacks any smart insights or AI tagging, everything has to be categorized manually. It is just a basic text container.
The billing cycle is very transparent and setup was fairly simple.`
  }
];

export default function CompetitorComparison({ myAnalysis }: CompetitorComparisonProps) {
  const [competitorName, setCompetitorName] = useState("InsightFlow AI");
  const [competitorReviews, setCompetitorReviews] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<CompetitorAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPreset = (presetIdx: number) => {
    const preset = PRESET_COMPETITORS[presetIdx];
    setCompetitorName(preset.name);
    setCompetitorReviews(preset.reviews);
    setError(null);
  };

  const handleRunComparison = async () => {
    if (!competitorReviews.trim()) {
      setError("Please paste competitor reviews first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Build a friendly textual summary of OUR performance to pass as context
      let myReviewsSummary = "No metrics analyzed yet.";
      if (myAnalysis) {
        myReviewsSummary = `Our product (SentioPoint AI) has an overall customer satisfaction score of ${myAnalysis.overallSentiment.satisfactionScore}% based on ${myAnalysis.overallSentiment.totalAnalyzed} reviews analyzed. Our positive sentiment is ${myAnalysis.overallSentiment.positiveCount} entries, neutral is ${myAnalysis.overallSentiment.neutralCount}, and negative is ${myAnalysis.overallSentiment.negativeCount}. Our top praises are: ${myAnalysis.executiveSummary.topPraises.map(p => p.title).join(", ")}. Our key improvements areas are: ${myAnalysis.executiveSummary.topImprovementAreas.map(i => i.title).join(", ")}.`;
      }

      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitorName,
          myReviewsSummary,
          competitorReviews
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to process competitor comparison.");
      }

      const data = await response.json();
      setComparisonResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred during competitor analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setComparisonResult(null);
    setCompetitorReviews("");
    setError(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <GitCompare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Competitor Intelligence</h2>
          <p className="text-xs text-slate-400">Run comparative sentiment modeling to expose competitor advantages</p>
        </div>
      </div>

      {!comparisonResult ? (
        <div className="space-y-6">
          {/* Quick presets */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Quick Load Test Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_COMPETITORS.map((preset, idx) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => loadPreset(idx)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
                  {preset.name} Feed
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Competitor Name */}
            <div className="md:col-span-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Competitor Name
              </label>
              <input
                type="text"
                placeholder="e.g., InsightFlow AI"
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Competitor Reviews Paste Area */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Paste Competitor Customer Reviews / Feedback
            </label>
            <textarea
              rows={5}
              placeholder="Paste reviews of your competitor here (one per line) or load a preset above to benchmark instantly..."
              value={competitorReviews}
              onChange={(e) => setCompetitorReviews(e.target.value)}
              className="w-full text-xs sm:text-sm font-mono border border-slate-200 rounded-lg p-3 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex justify-end">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleRunComparison}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium text-xs sm:text-sm px-6 py-2.5 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Modeling Competitor Sentiment...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Compare Performance
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* COMPARATIVE VIEW DASHBOARD */
        <div className="space-y-8 animate-fade-in text-slate-800">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Benchmark Active
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Our Performance vs. {comparisonResult.competitorName}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-indigo-600 transition flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Analyze Another Competitor
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Our Score Card */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  Our Satisfaction Index (Us)
                </span>
                <span className="text-3xl font-extrabold text-indigo-700">
                  {myAnalysis?.overallSentiment.satisfactionScore || 85}%
                </span>
                <p className="text-[10px] text-slate-500">
                  Based on {myAnalysis?.overallSentiment.totalAnalyzed || 25} analyzed customer voices
                </p>
              </div>
              <Award className="w-8 h-8 text-indigo-500" />
            </div>

            {/* Competitor Score Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  {comparisonResult.competitorName} Satisfaction
                </span>
                <span className="text-3xl font-extrabold text-slate-700">
                  {comparisonResult.overallSentiment.satisfactionScore}%
                </span>
                <p className="text-[10px] text-slate-500">
                  Based on {comparisonResult.overallSentiment.totalAnalyzed} competitor data entries
                </p>
              </div>
              <GitCompare className="w-8 h-8 text-slate-400" />
            </div>
          </div>

          {/* Side-by-Side Advantage Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Competitor Strengths */}
            <div className="border border-slate-100 rounded-xl p-5 bg-white space-y-3">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                Competitor Key Advantages
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {comparisonResult.strengths.map((st, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Competitor Weaknesses */}
            <div className="border border-slate-100 rounded-xl p-5 bg-white space-y-3">
              <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <ThumbsDown className="w-4 h-4 text-rose-400" />
                Competitor Pain Points
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {comparisonResult.weaknesses.map((wk, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="text-rose-400 font-bold shrink-0">⚠</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Comprehensive Narrative Analysis */}
          <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Comparative Executive Strategy</span>
            </div>
            <div className="text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-line space-y-3">
              {comparisonResult.comparisonSummary}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
