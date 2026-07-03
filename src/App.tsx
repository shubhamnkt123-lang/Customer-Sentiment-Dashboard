import { useState, useEffect } from "react";
const logo = "/src/assets/images/sentiopoint_logo_1783088174437.jpg";
import { Message, AnalysisResult, UserSubscription } from "./types";
import { SAMPLE_DATASETS } from "./data";
import ReviewInput from "./components/ReviewInput";
import WordCloud from "./components/WordCloud";
import SentimentChart from "./components/SentimentChart";
import AdvisorChat from "./components/AdvisorChat";
import TopicModeling from "./components/TopicModeling";
import AlertsManager from "./components/AlertsManager";
import CompetitorComparison from "./components/CompetitorComparison";
import SubscriptionPlans from "./components/SubscriptionPlans";
import AdvancedCharts from "./components/AdvancedCharts";
import AuthModal from "./components/AuthModal";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  Sparkles,
  BarChart3,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Info,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  FileDown,
  User as UserIcon,
  LogOut,
  LogIn
} from "lucide-react";

export default function App() {
  // Set default state to the first sample dataset for an immediate wow-factor
  const [reviewsText, setReviewsText] = useState(SAMPLE_DATASETS[0].reviews);
  const [focusArea, setFocusArea] = useState(SAMPLE_DATASETS[0].focusArea);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Subscription management state
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    const saved = localStorage.getItem("sentiopoint_subscription");
    return saved ? JSON.parse(saved) : { tier: "free", billingCycle: "monthly", status: "active" };
  });
  const [plansModalOpen, setPlansModalOpen] = useState(false);

  // Load and save subscription linked with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.subscription) {
              setSubscription(data.subscription);
              localStorage.setItem("sentiopoint_subscription", JSON.stringify(data.subscription));
            }
          } else {
            // Document doesn't exist, create it with local state
            await setDoc(docRef, {
              subscription: subscription,
              updatedAt: serverTimestamp()
            }, { merge: true });
          }
        } catch (err) {
          console.error("Error loading user subscription from Firestore:", err);
        }
      } else {
        // Fallback to local storage when logged out
        const saved = localStorage.getItem("sentiopoint_subscription");
        setSubscription(saved ? JSON.parse(saved) : { tier: "free", billingCycle: "monthly", status: "active" });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateSubscription = async (newSub: UserSubscription) => {
    setSubscription(newSub);
    localStorage.setItem("sentiopoint_subscription", JSON.stringify(newSub));

    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        await setDoc(docRef, {
          subscription: newSub,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error("Error updating subscription in Firestore:", err);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUserDropdownOpen(false);
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const handleDownloadPDF = () => {
    if (subscription.tier === "free") {
      setDownloadModalOpen(true);
      return;
    }

    if (analysis) {
      const reportTitle = `SentioPoint Customer Intelligence Executive Report - ${focusArea || "General Analysis"}`;
      const lineBreak = "================================================================================";
      const fileContent = `${reportTitle}
Date Generated: ${new Date().toLocaleDateString()}
Current Subscription Tier: SentioPoint ${subscription.tier.toUpperCase()}

${lineBreak}
I. EXECUTIVE OVERALL SATISFACTION SUMMARY
${lineBreak}
Customer Satisfaction Score: ${analysis.overallSentiment.satisfactionScore}%
Total Analyzed Volume: ${analysis.overallSentiment.totalAnalyzed} reviews
Positive Sentiments: ${analysis.overallSentiment.positiveCount} reviews (${Math.round((analysis.overallSentiment.positiveCount / analysis.overallSentiment.totalAnalyzed) * 100)}%)
Neutral Sentiments: ${analysis.overallSentiment.neutralCount} reviews (${Math.round((analysis.overallSentiment.neutralCount / analysis.overallSentiment.totalAnalyzed) * 100)}%)
Negative Sentiments: ${analysis.overallSentiment.negativeCount} reviews (${Math.round((analysis.overallSentiment.negativeCount / analysis.overallSentiment.totalAnalyzed) * 100)}%)

${lineBreak}
II. KEY THEME & TOPIC ANALYSIS
${lineBreak}
${analysis.topics.map((t, i) => `${i + 1}. Topic: ${t.name}
   * Volume Mentions: ${t.count}
   * Proportional Sentiment breakdown: ${t.positivePercentage}% Pos, ${t.neutralPercentage}% Neu, ${t.negativePercentage}% Neg
   * Customer Quote Sample: "${t.keyFeedbackSample || ""}"`).join("\n\n")}

${lineBreak}
III. USER COMPLAINTS & DEFECT MATRIX
${lineBreak}
${analysis.complaints.map((c, i) => `${i + 1}. Theme: ${c.category}
   * Severity: ${c.severity.toUpperCase()}
   * Frequency: ${c.mentionsCount} mentions
   * Summary: ${c.description}`).join("\n\n")}

${lineBreak}
IV. HIGH-IMPACT SUGGESTIONS & RECOVERY ROADMAP
${lineBreak}
${analysis.suggestions.map((s, i) => `${i + 1}. Title: ${s.title} [Priority: ${s.priority.toUpperCase()}]
   * Rationale: ${s.rationale}
   * Engineering Effort Cost: ${s.effort}
   * Execution Action Steps:
     ${s.actionPlan.map((step, stepIdx) => `${stepIdx + 1}. ${step}`).join("\n     ")}`).join("\n\n")}

${lineBreak}
Generated securely in the SentioPoint Sandbox Environment. All rights reserved.
`;

      const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      element.download = `sentiopoint_executive_report_${(focusArea || "analysis").toLowerCase().replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }

    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Initialize chat history with a welcoming model turn
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "model",
      content: `Hello! I am your AI Sentiment Advisor. 

I've got the full review dataset and metrics loaded into my memory. Ask me anything, for example:
• "Draft a professional customer email response to the complaints about performance."
• "Create a 3-step action plan to solve the learning curve issue."
• "How can we leverage our outstanding Slack integrations in our marketing copy?"`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const handleAnalyze = async () => {
    if (reviewsText.trim().length === 0) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviews: reviewsText,
          focusArea: focusArea.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze customer reviews.");
      }

      const result: AnalysisResult = await response.json();
      setAnalysis(result);

      // Reset chatbot history when a new analysis is loaded, loaded with new context
      setChatMessages([
        {
          id: "welcome-message",
          role: "model",
          content: `Hello! I have completed analyzing the new review dataset. 
          
Overall customer satisfaction is rated at **${result.overallSentiment.satisfactionScore}%**.
I'm ready to answer any questions, draft replies, or discuss tactical solutions for:
1. **${result.executiveSummary.topImprovementAreas[0]?.title || "Improvement Area 1"}**
2. **${result.executiveSummary.topImprovementAreas[1]?.title || "Improvement Area 2"}**
3. **${result.executiveSummary.topImprovementAreas[2]?.title || "Improvement Area 3"}**`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleWordCloudClick = (word: string) => {
    // Inject a question directly into the chatbot
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: `What specific comments did customers make regarding "${word}"? Can you summarize their feedback and suggest a course of action?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    triggerChatReply([...chatMessages, userMsg]);
  };

  const triggerChatReply = async (history: Message[]) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          analysisContext: analysis,
          rawReviews: reviewsText,
        }),
      });

      if (!response.ok) throw new Error("Chat response failed");
      const data = await response.json();

      const modelMsg: Message = {
        id: crypto.randomUUID(),
        role: "model",
        content: data.text || "I apologize, but I couldn't process that keyword query.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "model",
        content: "Sorry, I ran into an error getting more insights for that keyword.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    }
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 75) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const getSatisfactionRingColor = (score: number) => {
    if (score >= 75) return "stroke-emerald-500";
    if (score >= 50) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans flex flex-col">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="SentioPoint AI Logo"
              referrerPolicy="no-referrer"
              className="w-9 h-9 object-cover rounded-xl border border-slate-200 shadow-xs"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                SentioPoint AI
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Customer Sentiment Dashboard
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPlansModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border text-xs font-extrabold rounded-xl transition cursor-pointer select-none ${
                subscription.tier === "free"
                  ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  : subscription.tier === "growth"
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/70"
                  : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100/70"
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${subscription.tier !== 'free' ? 'fill-current text-amber-500 animate-pulse' : 'text-slate-400'}`} />
              <span className="capitalize">{subscription.tier} Plan</span>
              <span className="text-[10px] font-normal opacity-75">(Manage)</span>
            </button>

            {/* Auth Dropdown Widget */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {(user.displayName || user.email || "G").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[100px] truncate">
                      {user.displayName || user.email?.split("@")[0] || "User"}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20 cursor-default"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-3 z-30 animate-scale-in">
                        <div className="border-b border-slate-100 pb-2.5">
                          <p className="text-xs font-extrabold text-slate-800 truncate">
                            {user.displayName || "SentioPoint User"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                            {user.email || "Anonymous Guest"}
                          </p>
                        </div>
                        <div className="space-y-1 text-[10px] font-mono text-slate-500 leading-normal">
                          <p>
                            Status: <span className="text-emerald-600 font-bold">Authenticated</span>
                          </p>
                          <p>
                            Type: <span className="text-indigo-600 font-bold capitalize">{user.isAnonymous ? "Guest Profile" : "Email/Google User"}</span>
                          </p>
                          <p>
                            UID: <span className="text-slate-400">{user.uid.substring(0, 8)}...</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-rose-100"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out Account
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )}
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 rounded-xl select-none">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Secure Sandbox
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/50 border border-indigo-100 text-xs font-semibold text-indigo-700 rounded-xl select-none">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              Gemini 3.5 AI Engine
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {!analysis ? (
          /* ================= MODE 1: WELCOME & INPUT FORM ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input card takes 8 cols */}
            <div className="lg:col-span-8">
              <ReviewInput
                reviewsText={reviewsText}
                setReviewsText={setReviewsText}
                focusArea={focusArea}
                setFocusArea={setFocusArea}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                error={error}
                subscription={subscription}
                onOpenPlans={() => setPlansModalOpen(true)}
              />
            </div>

            {/* Sidebar / Feature Info takes 4 cols */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  How does it work?
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Paste or Upload Feedback</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Input lists of customer logs, support transcripts, product reviews, or test comments.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Gemini Intelligence Parsing</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Uses <strong>Gemini 3.5</strong> with high-thinking reasoning to isolate themes, generate a word cloud, and extract sentiment.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Actionable Improvement Report</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Generates trend lines, interactive praises/complaints, exactly 3 high-impact improvement suggestions, and a dedicated AI Chat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safe Tip Box */}
              <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6 text-xs text-indigo-950 leading-relaxed">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-bold text-indigo-900">Pro Tip for Quick Testing</span>
                </div>
                We pre-loaded our <strong>TaskFlow SaaS Reviews</strong> dataset by default. 
                Simply click the big purple button to see how Gemini structures insights and spins up the Advisor!
              </div>
            </div>
          </div>
        ) : (
          /* ================= MODE 2: THE DASHBOARD REPORT ================= */
          <div className="space-y-8 animate-fade-in">
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm no-print">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setAnalysis(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all px-3 py-1.5 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Analyze New Feedback
                </button>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>Active Dataset: <strong>{reviewsText.substring(0, 30)}...</strong></span>
                  <span>&bull;</span>
                  <span>Focus Area: <strong>{focusArea || "General Analysis"}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 transition-all px-4 py-2 rounded-xl shadow-sm cursor-pointer select-none"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF Report
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Overall Score Circle Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between col-span-1 md:col-span-2">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Customer Satisfaction
                  </span>
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {analysis.overallSentiment.satisfactionScore}%
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Weighted index indicating positive sentiment across all analyzed reviews.
                  </p>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getSatisfactionColor(analysis.overallSentiment.satisfactionScore)}`}>
                    {analysis.overallSentiment.satisfactionScore >= 75 ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Excellent Standard
                      </>
                    ) : analysis.overallSentiment.satisfactionScore >= 50 ? (
                      <>
                        <Info className="w-3.5 h-3.5 text-amber-600" /> Attention Required
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Critical Warning
                      </>
                    )}
                  </div>
                </div>

                {/* SVG Circular Progress Ring */}
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={getSatisfactionRingColor(analysis.overallSentiment.satisfactionScore)}
                      strokeDasharray={`${analysis.overallSentiment.satisfactionScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-800 text-lg">
                    {analysis.overallSentiment.satisfactionScore}%
                  </div>
                </div>
              </div>

              {/* Sentiment Breakdowns */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                    Feedback Breakdown
                  </span>
                  <div className="space-y-2.5">
                    {/* Positive */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-emerald-600 flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" /> Positive
                        </span>
                        <span className="text-slate-700">{analysis.overallSentiment.positiveCount} ({Math.round((analysis.overallSentiment.positiveCount / analysis.overallSentiment.totalAnalyzed) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${(analysis.overallSentiment.positiveCount / analysis.overallSentiment.totalAnalyzed) * 100}%` }}
                        />
                      </div>
                    </div>
                    {/* Neutral */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-500">Neutral</span>
                        <span className="text-slate-700">{analysis.overallSentiment.neutralCount} ({Math.round((analysis.overallSentiment.neutralCount / analysis.overallSentiment.totalAnalyzed) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-400 h-2 rounded-full"
                          style={{ width: `${(analysis.overallSentiment.neutralCount / analysis.overallSentiment.totalAnalyzed) * 100}%` }}
                        />
                      </div>
                    </div>
                    {/* Negative */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-rose-600 flex items-center gap-1">
                          <ThumbsDown className="w-3.5 h-3.5" /> Negative
                        </span>
                        <span className="text-slate-700">{analysis.overallSentiment.negativeCount} ({Math.round((analysis.overallSentiment.negativeCount / analysis.overallSentiment.totalAnalyzed) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-2 rounded-full"
                          style={{ width: `${(analysis.overallSentiment.negativeCount / analysis.overallSentiment.totalAnalyzed) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Volume Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Dataset Size
                  </span>
                  <span className="text-xs text-slate-400 block mb-4">Reviews analyzed</span>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {analysis.overallSentiment.totalAnalyzed}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Extracted from raw feedback blocks, filtered for analytical substance.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Charts Layout: Trend and Word Cloud side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Trend Card */}
              <div className="lg:col-span-7">
                <SentimentChart data={analysis.sentimentTrend} />
              </div>

              {/* Word Cloud Card */}
              <div className="lg:col-span-5">
                <WordCloud words={analysis.wordCloud} onWordClick={handleWordCloudClick} />
              </div>
            </div>

            {/* Topic Modeling and Alerts Center side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7">
                <TopicModeling topics={analysis.topics} />
              </div>
              <div className="lg:col-span-5">
                <AlertsManager analysisResult={analysis} rawReviews={reviewsText} />
              </div>
            </div>

            {/* Deep Analysis & Action Plan + Assistant side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Action areas and Praises */}
              <div className="lg:col-span-7 space-y-8">
                {/* Executive Summary & Improvement Plan - Premium Slate Theme */}
                <div className="bg-slate-900 rounded-2xl p-8 flex flex-col shadow-xl text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-1.5 bg-indigo-500/20 rounded-md">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-medium text-white">AI Executive Summary</h2>
                  </div>

                  {/* Overview Text Block */}
                  <p className="text-slate-300 text-sm leading-relaxed mb-8">
                    {analysis.executiveSummary.overview}
                  </p>

                  {/* Action Items Grid */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 block">
                      Top 3 Improvement Actions
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {analysis.executiveSummary.topImprovementAreas.map((area, idx) => (
                        <div key={area.title} className="space-y-4">
                          <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider">
                            {String(idx + 1).padStart(2, '0')}. {area.title}
                          </div>
                          
                          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                            {area.description}
                          </p>

                          {area.evidence && (
                            <div className="bg-slate-800/50 border-l-2 border-indigo-500/50 rounded-r-lg p-3 text-[11px] text-slate-400 italic leading-relaxed">
                              &ldquo;{area.evidence}&rdquo;
                            </div>
                          )}

                          <div className="pt-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              area.impact.toLowerCase() === "high"
                                ? "bg-red-500/20 text-red-300 border-red-500/30"
                                : area.impact.toLowerCase() === "medium"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                            }`}>
                              {area.impact} Impact
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-800">
                    <div className="text-[11px] text-slate-500">Report analyzed in 1.4s by SentioPoint AI Engine</div>
                    <div className="text-[11px] text-indigo-400 font-medium">Interactive Advisory Ready</div>
                  </div>
                </div>

                {/* Top Praises Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <ThumbsUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Top Praises</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.executiveSummary.topPraises.map((praise, idx) => (
                      <div
                        key={praise.title}
                        className="p-4 bg-emerald-50/20 border border-emerald-100/50 rounded-xl"
                      >
                        <h4 className="text-xs sm:text-sm font-bold text-emerald-800 mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          {praise.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-emerald-700 leading-relaxed">
                          {praise.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Embedded Chat Advisor */}
              <div className="lg:col-span-5 h-full lg:sticky lg:top-[92px]">
                <AdvisorChat
                  analysis={analysis}
                  rawReviews={reviewsText}
                  messages={chatMessages}
                  setMessages={setChatMessages}
                />
              </div>
            </div>

            {/* Advanced Analytics & Charts */}
            <AdvancedCharts
              analysis={analysis}
              subscription={subscription}
              onOpenPlans={() => setPlansModalOpen(true)}
            />

            {/* Competitor Analysis and Benchmarking */}
            <CompetitorComparison myAnalysis={analysis} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 SentioPoint AI. Built for business strategists & support teams.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Server Connected
            </span>
          </div>
        </div>
      </footer>

      {/* Subscription Pricing Matrix Modal */}
      <SubscriptionPlans
        subscription={subscription}
        onUpdateSubscription={handleUpdateSubscription}
        isOpen={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
      />

      {/* User Authentication Modal (Google / Email / Guest) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Premium Download PDF Alert Modal */}
      {downloadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] no-print">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-slate-800 animate-scale-in">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto animate-bounce">
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Unlock Executive PDF Reports</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Exporting downloadable analysis summary briefs and high-fidelity PDF documents is a premium feature.
                </p>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-left mt-4 text-[11px] leading-relaxed text-indigo-900">
                  <span className="font-bold">Upgrade to Growth today for just $5/mo:</span>
                  <ul className="list-disc pl-4 mt-1.5 space-y-1">
                    <li>Generate unlimited customer feedback analysis runs</li>
                    <li>Unlocks high-fidelity downloadable PDF reports</li>
                    <li>Unlocks Interactive Analytics &amp; Competitor Intelligence</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDownloadModalOpen(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Keep Free Version
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDownloadModalOpen(false);
                    setPlansModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  Upgrade for $5/mo
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
