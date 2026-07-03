import React, { useState, useEffect } from "react";
import { AlertRule, TriggeredAlert, AnalysisResult } from "../types";
import { 
  Bell, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  VolumeX, 
  AlertCircle,
  Clock,
  Settings,
  X,
  Sparkles
} from "lucide-react";

interface AlertsManagerProps {
  analysisResult: AnalysisResult | null;
  rawReviews: string;
}

const DEFAULT_RULES: AlertRule[] = [
  {
    id: "rule-sat-drop",
    name: "Critical Satisfaction Drop",
    type: "sentiment",
    thresholdValue: "<75",
    isActive: true,
    description: "Triggers if overall customer satisfaction rating drops below 75%"
  },
  {
    id: "rule-keyword-perf",
    name: "Performance & Lag Spike",
    type: "keyword",
    thresholdValue: "slow,sluggish,crash,lag,bug,freeze",
    isActive: true,
    description: "Triggers if reviews mention performance lag, freezes, or crashes"
  },
  {
    id: "rule-keyword-support",
    name: "Support Response Backlog",
    type: "keyword",
    thresholdValue: "support,ticket,ignore,wait,days,slow response",
    isActive: true,
    description: "Triggers if support delays or customer care issues are reported"
  },
  {
    id: "rule-keyword-billing",
    name: "Pricing & Billing Friction",
    type: "keyword",
    thresholdValue: "price,cost,billing,subscription,expensive,paywall",
    isActive: false,
    description: "Triggers if billing complaints or price complaints surface"
  },
  {
    id: "rule-neg-volume",
    name: "High Negative Feedback Volume",
    type: "volume",
    thresholdValue: ">15",
    isActive: true,
    description: "Triggers if negative feedback count exceeds 15% of the total dataset"
  }
];

export default function AlertsManager({ analysisResult, rawReviews }: AlertsManagerProps) {
  const [rules, setRules] = useState<AlertRule[]>(() => {
    const saved = localStorage.getItem("sentiopoint_alert_rules");
    return saved ? JSON.parse(saved) : DEFAULT_RULES;
  });
  
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([]);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  
  // Custom Rule Form State
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleType, setNewRuleType] = useState<"sentiment" | "keyword" | "volume">("sentiment");
  const [newRuleThreshold, setNewRuleThreshold] = useState("");
  const [newRuleDesc, setNewRuleDesc] = useState("");

  // Save rules to localStorage
  useEffect(() => {
    localStorage.setItem("sentiopoint_alert_rules", JSON.stringify(rules));
  }, [rules]);

  // Evaluate alerts in real-time based on rules and analysis
  useEffect(() => {
    if (!analysisResult) {
      setTriggeredAlerts([]);
      return;
    }

    const alerts: TriggeredAlert[] = [];
    const lowerReviews = rawReviews.toLowerCase();
    const score = analysisResult.overallSentiment.satisfactionScore;
    const negCount = analysisResult.overallSentiment.negativeCount;
    const totalCount = analysisResult.overallSentiment.totalAnalyzed || 1;
    const negRatio = (negCount / totalCount) * 100;

    rules.forEach((rule) => {
      if (!rule.isActive) return;

      if (rule.type === "sentiment") {
        const value = parseInt(rule.thresholdValue.replace(/[^0-9]/g, ""), 10);
        const direction = rule.thresholdValue.includes("<") ? "less" : "greater";
        
        if (direction === "less" && score < value) {
          alerts.push({
            id: `trigger-${rule.id}-${Date.now()}`,
            ruleId: rule.id,
            name: rule.name,
            severity: score < 60 ? "high" : "medium",
            message: `Average Satisfaction Score is ${score}%, which is lower than the threshold limit of ${value}%.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            details: "An immediate product sprint or bugfix is recommended to patch baseline customer sentiment."
          });
        } else if (direction === "greater" && score > value) {
          alerts.push({
            id: `trigger-${rule.id}-${Date.now()}`,
            ruleId: rule.id,
            name: rule.name,
            severity: "low",
            message: `Average Satisfaction Score is ${score}%, exceeding positive limit of ${value}%.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            details: "Strong positive momentum detected."
          });
        }
      }

      if (rule.type === "volume") {
        const val = parseInt(rule.thresholdValue.replace(/[^0-9]/g, ""), 10);
        if (negRatio > val) {
          alerts.push({
            id: `trigger-${rule.id}-${Date.now()}`,
            ruleId: rule.id,
            name: rule.name,
            severity: negRatio > 25 ? "high" : "medium",
            message: `Negative feedback volume spike at ${negRatio.toFixed(1)}%, exceeding threshold of ${val}%.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            details: `${negCount} out of ${totalCount} feedback entries are categorized as negative.`
          });
        }
      }

      if (rule.type === "keyword") {
        const keywords = rule.thresholdValue.split(",").map(k => k.trim().toLowerCase());
        const matchingKeywords: string[] = [];
        
        keywords.forEach(kw => {
          if (kw && lowerReviews.includes(kw)) {
            matchingKeywords.push(kw);
          }
        });

        if (matchingKeywords.length > 0) {
          // Find representative sentence matching the keyword
          const sentences = rawReviews.split(/[.!?]+/);
          const matchedSentence = sentences.find(s => 
            matchingKeywords.some(kw => s.toLowerCase().includes(kw))
          )?.trim();

          alerts.push({
            id: `trigger-${rule.id}-${Date.now()}`,
            ruleId: rule.id,
            name: rule.name,
            severity: matchingKeywords.length >= 3 ? "high" : "medium",
            message: `Spike in negative reviews containing: ${matchingKeywords.slice(0, 3).map(k => `"${k}"`).join(", ")}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            details: matchedSentence 
              ? `Highlighted complaint: "${matchedSentence}."`
              : `System identified recurring references to matching phrases: ${matchingKeywords.join(", ")}.`
          });
        }
      }
    });

    setTriggeredAlerts(alerts);
  }, [rules, analysisResult, rawReviews]);

  const handleToggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newRuleThreshold) return;

    const newRule: AlertRule = {
      id: `rule-custom-${Date.now()}`,
      name: newRuleName,
      type: newRuleType,
      thresholdValue: newRuleThreshold,
      isActive: true,
      description: newRuleDesc || `Custom ${newRuleType} rule targeting ${newRuleThreshold}`
    };

    setRules([...rules, newRule]);
    setNewRuleName("");
    setNewRuleThreshold("");
    setNewRuleDesc("");
    setShowAddRuleModal(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${triggeredAlerts.length > 0 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-emerald-50 text-emerald-600"}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                Real-Time Alert Center
                {triggeredAlerts.length > 0 && (
                  <span className="h-2.5 w-2.5 bg-rose-500 rounded-full animate-ping" />
                )}
              </h2>
              <p className="text-xs text-slate-400">Dynamic thresholds checking incoming customer complaints</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddRuleModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Rule
          </button>
        </div>

        {/* Dynamic Alerts Content */}
        {!analysisResult ? (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-xl mb-6">
            <VolumeX className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs text-slate-500 font-medium text-center">
              Awaiting dataset review analysis to activate real-time alerting engine.
            </p>
          </div>
        ) : triggeredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 bg-emerald-50/50 border border-emerald-100 rounded-xl mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="text-xs font-semibold text-emerald-800 text-center">
              All quiet. No thresholds breached!
            </p>
            <p className="text-[10px] text-emerald-600 text-center mt-0.5">
              Active rules are running diagnostics in the background.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6 max-h-[280px] overflow-y-auto pr-1">
            {triggeredAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-xl border flex gap-3 transition-transform ${
                  alert.severity === "high" 
                    ? "bg-rose-50/50 border-rose-200 text-rose-950" 
                    : alert.severity === "medium"
                    ? "bg-amber-50/50 border-amber-200 text-amber-950"
                    : "bg-blue-50/50 border-blue-200 text-blue-950"
                }`}
              >
                <div className="mt-0.5">
                  <ShieldAlert className={`w-5 h-5 shrink-0 ${
                    alert.severity === "high" 
                      ? "text-rose-600" 
                      : alert.severity === "medium" 
                      ? "text-amber-600" 
                      : "text-blue-500"
                  }`} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {alert.name}
                    </span>
                    <span className="text-[10px] opacity-70 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.timestamp}
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">{alert.message}</p>
                  <p className="text-[11px] opacity-80 italic leading-relaxed pt-1 border-t border-slate-100">
                    {alert.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alert Rules Section */}
        <div>
          <div className="flex items-center gap-1.5 mb-3 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Settings className="w-3.5 h-3.5" />
            <span>Diagnostics Rules Configuration ({rules.length})</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {rules.map((rule) => (
              <div 
                key={rule.id}
                className="flex items-center justify-between p-3 border border-slate-100 hover:bg-slate-50/50 rounded-lg text-xs"
              >
                <div className="space-y-0.5 max-w-[70%]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{rule.name}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded font-bold uppercase">
                      {rule.type}
                    </span>
                    <span className="font-mono text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1 rounded">
                      {rule.thresholdValue}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal line-clamp-1">
                    {rule.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleRule(rule.id)}
                    title={rule.isActive ? "Deactivate rule" : "Activate rule"}
                    className="text-slate-400 hover:text-indigo-600 transition"
                  >
                    {rule.isActive ? (
                      <ToggleRight className="w-6 h-6 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.id)}
                    title="Delete rule"
                    className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 text-right pt-4 mt-4 border-t border-slate-100">
        Rules are evaluated on-the-fly inside local sandbox browser context.
      </div>

      {/* CREATE RULE MODAL */}
      {showAddRuleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl p-6 relative animate-scale-in">
            <button
              type="button"
              onClick={() => setShowAddRuleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900">Configure Alert Diagnostic Rule</h3>
            </div>

            <form onSubmit={handleAddRuleSubmit} className="space-y-4 text-slate-800">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Performance Blacklist"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Trigger Target Type
                </label>
                <select
                  value={newRuleType}
                  onChange={(e) => setNewRuleType(e.target.value as any)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="sentiment">Sentiment Score (Overall)</option>
                  <option value="keyword">Negative Keywords Spike</option>
                  <option value="volume">Negative Count Volume</option>
                </select>
              </div>

              {/* Threshold */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex justify-between items-center">
                  <span>Trigger Threshold Limit</span>
                  <span className="text-[9px] font-normal text-slate-400 lowercase">
                    {newRuleType === "sentiment" && "format '<80' or '>90'"}
                    {newRuleType === "keyword" && "comma separated keywords"}
                    {newRuleType === "volume" && "format '>15' for % ratio"}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    newRuleType === "sentiment" 
                      ? "e.g., <75" 
                      : newRuleType === "keyword" 
                      ? "e.g., bug,error,down,slow" 
                      : "e.g., >15"
                  }
                  value={newRuleThreshold}
                  onChange={(e) => setNewRuleThreshold(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  placeholder="What triggers this alert? (Shown on triggered lists)"
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  rows={2}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
