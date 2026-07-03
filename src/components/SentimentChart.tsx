import { SentimentTrendPoint } from "../types";
import { TrendingUp, LineChart as ChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface SentimentChartProps {
  data: SentimentTrendPoint[];
}

export default function SentimentChart({ data }: SentimentChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center min-h-[350px]">
        <p className="text-sm text-slate-400">No trend data available.</p>
      </div>
    );
  }

  // Calculate some aggregate metrics
  const scores = data.map((p) => p.averageScore);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const startScore = scores[0];
  const endScore = scores[scores.length - 1];
  const percentageChange = startScore > 0 ? ((endScore - startScore) / startScore) * 100 : 0;

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-lg text-xs leading-relaxed max-w-xs">
          <p className="font-bold text-slate-200 mb-1.5 border-b border-slate-800 pb-1">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-6">
              <span className="text-emerald-400 font-medium">Positive Volume:</span>
              <span className="font-semibold">{payload[0]?.value} reviews</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-400 font-medium">Neutral Volume:</span>
              <span className="font-semibold">{payload[1]?.value} reviews</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-rose-400 font-medium">Negative Volume:</span>
              <span className="font-semibold">{payload[2]?.value} reviews</span>
            </div>
            <div className="flex justify-between gap-6 border-t border-slate-800 pt-1.5 mt-1.5">
              <span className="text-indigo-300 font-bold">Satisfaction Rating:</span>
              <span className="font-bold text-indigo-200">{payload[3]?.value}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full justify-between">
      <div>
        {/* Header with Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Sentiment Trend Over Time</h3>
              <p className="text-xs text-slate-400">Chronological analysis of customer feedback score vs volume</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Trend Shift
              </span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                {percentageChange >= 0 ? (
                  <span className="text-emerald-600">+{percentageChange.toFixed(1)}%</span>
                ) : (
                  <span className="text-rose-600">{percentageChange.toFixed(1)}%</span>
                )}
                <TrendingUp className={`w-3.5 h-3.5 ${percentageChange >= 0 ? "text-emerald-500" : "text-rose-500 rotate-180"}`} />
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Rating Range
              </span>
              <span className="text-sm font-bold text-slate-800">
                {minScore}% - {maxScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-[280px] w-full mt-2 select-none">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: -5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="period"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              {/* Left YAxis for Review Counts */}
              <YAxis
                yAxisId="left"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                label={{ value: "Review Count", angle: -90, position: "insideLeft", offset: -5, fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
              />
              {/* Right YAxis for Sentiment Score */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#6366f1"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
                label={{ value: "Satisfaction Rating", angle: 90, position: "insideRight", offset: -5, fill: "#6366f1", fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: "#64748b" }}
              />

              {/* Stacked Bars for Feedback Volume */}
              <Bar
                yAxisId="left"
                dataKey="positive"
                name="Positive Volume"
                stackId="feedback"
                fill="#10b981"
                radius={[0, 0, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                yAxisId="left"
                dataKey="neutral"
                name="Neutral Volume"
                stackId="feedback"
                fill="#94a3b8"
                radius={[0, 0, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                yAxisId="left"
                dataKey="negative"
                name="Negative Volume"
                stackId="feedback"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />

              {/* High-Contrast Line for Average Sentiment Score */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="averageScore"
                name="Satisfaction Score (%)"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ stroke: "#4f46e5", strokeWidth: 2, r: 4, fill: "#fff" }}
                activeDot={{ r: 6, fill: "#4f46e5" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed mt-4 border-t border-slate-200 pt-3">
        * Satisfaction score represents the overall user sentiment rating calculated by the model. 
        Volume counts show positive, neutral, and negative comments captured in each chronological block.
      </p>
    </div>
  );
}
