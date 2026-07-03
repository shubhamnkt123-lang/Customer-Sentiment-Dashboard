import React from "react";
import { AnalysisResult, UserSubscription } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { BarChart3, PieChart as PieIcon, Sparkles, Lock, ArrowRight, TrendingUp } from "lucide-react";

interface AdvancedChartsProps {
  analysis: AnalysisResult;
  subscription: UserSubscription;
  onOpenPlans: () => void;
}

export default function AdvancedCharts({ analysis, subscription, onOpenPlans }: AdvancedChartsProps) {
  const isPremium = subscription.tier !== "free";

  // Data 1: Topic Mentions Bar Chart
  const topicBarData = analysis.topics.map((t) => ({
    name: t.name.length > 15 ? t.name.substring(0, 15) + "..." : t.name,
    mentions: t.count,
    positive: Math.round((t.count * t.positivePercentage) / 100),
    negative: Math.round((t.count * t.negativePercentage) / 100),
  }));

  // Data 2: Sentiment Distribution Pie Chart
  const sentimentPieData = [
    { name: "Positive Sentiment", value: analysis.overallSentiment.positiveCount, color: "#10b981" },
    { name: "Neutral Sentiment", value: analysis.overallSentiment.neutralCount, color: "#94a3b8" },
    { name: "Negative Sentiment", value: analysis.overallSentiment.negativeCount, color: "#f43f5e" },
  ].filter((item) => item.value > 0);

  const totalReviews = analysis.overallSentiment.totalAnalyzed;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Advanced Analytics Intelligence</h2>
            <p className="text-xs text-slate-400">Granular correlation matrices and topic sentiment distributions</p>
          </div>
        </div>

        {!isPremium && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-extrabold uppercase tracking-wider rounded-full">
            <Lock className="w-3 h-3" />
            Premium Feature
          </span>
        )}
      </div>

      {/* Main Container */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch ${!isPremium ? "blur-[4px] pointer-events-none select-none" : ""}`}>
        
        {/* Topic Volume Chart */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <span>Topic Distribution & Impact</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Volume comparison and absolute sentiment sentiment weight per topic.</p>
          </div>

          <div className="h-[250px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicBarData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
                  labelClassName="font-bold text-slate-200"
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                <Bar dataKey="positive" name="Positive Mentions" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="negative" name="Negative Mentions" fill="#f43f5e" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Separator for LG screens */}
        <div className="hidden lg:block lg:col-span-1 w-px bg-slate-100 self-stretch my-2" />

        {/* Overall Sentiment Share Pie Chart */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-indigo-500" />
              <span>Overall Sentiment Share</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-normal">Relative proportion of customer emotion volumes.</p>
          </div>

          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4">
            {sentimentPieData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-500 font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-700">
                  {entry.value} ({Math.round((entry.value / totalReviews) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Upgrade Overlay */}
      {!isPremium && (
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 max-w-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto animate-bounce">
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                Unlock Interactive Analytics
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Unlock advanced topic correlation charts, sentiment distribution pie charts, and deeper analytical oversight.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenPlans}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold tracking-tight transition flex items-center justify-center gap-1.5"
            >
              Upgrade to Pro / Growth ($5/mo)
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
