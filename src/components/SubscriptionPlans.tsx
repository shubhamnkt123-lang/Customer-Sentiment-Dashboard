import React, { useState } from "react";
import { UserSubscription } from "../types";
import { 
  Check, 
  Sparkles, 
  HelpCircle, 
  CreditCard, 
  X, 
  Gift, 
  Zap, 
  ShieldCheck, 
  Info,
  Building2,
  Lock,
  ArrowRight,
  QrCode,
  Smartphone,
  Landmark,
  Copy
} from "lucide-react";

interface SubscriptionPlansProps {
  subscription: UserSubscription;
  onUpdateSubscription: (sub: UserSubscription) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface TierInfo {
  name: string;
  desc: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  lockedFeatures: string[];
  color: string;
  icon: React.ComponentType<any>;
  popular?: boolean;
}

const TIER_DETAILS: Record<"free" | "growth" | "enterprise", TierInfo> = {
  free: {
    name: "Starter / Free",
    desc: "Perfect for testing sandbox diagnostics and evaluating basic customer inputs.",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "Up to 15 customer reviews per analysis",
      "Standard Sentiment Analysis & charts",
      "Basic Word Cloud generation",
      "Default 5-day history log",
      "1 Active Real-Time Alert rule",
    ],
    lockedFeatures: [
      "Topic Modeling & theme categorization",
      "Competitor Intelligence comparison",
      "Priority advisor response times",
      "Unlimited active alert rules",
    ],
    color: "slate",
    icon: Info
  },
  growth: {
    name: "Growth / Pro",
    desc: "For fast-scaling product teams who need deeper categorization and competitor oversight.",
    priceMonthly: 5,
    priceYearly: 4,
    features: [
      "Unlimited customer reviews per analysis",
      "Advanced Topic Modeling & theme ratios",
      "Competitor Intelligence Comparison unlocked",
      "Up to 10 Active Real-Time Alert rules",
      "Priority Gemini AI processing speeds",
      "Full word-cloud extraction & advanced charts",
      "Export analysis reports as PDF/JSON",
    ],
    lockedFeatures: [
      "Dedicated multi-channel integrations",
      "Enterprise multi-competitor matrices",
    ],
    color: "indigo",
    icon: Zap,
    popular: true
  },
  enterprise: {
    name: "Enterprise",
    desc: "Fully tailor-made solution for multi-product corporations looking for integrated intelligence.",
    priceMonthly: 20,
    priceYearly: 16,
    features: [
      "Everything in Growth / Pro plan",
      "Advanced Multi-Competitor comparison matrices",
      "Unlimited active Alert Rules",
      "Dedicated webhook, Slack, & email alerts",
      "Priority support with 24-hour SLA",
      "Custom system integration consulting",
      "99.9% dev-server service uptime guarantee",
    ],
    lockedFeatures: [],
    color: "purple",
    icon: Building2
  }
};

export default function SubscriptionPlans({ 
  subscription, 
  onUpdateSubscription, 
  isOpen, 
  onClose 
}: SubscriptionPlansProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(subscription.billingCycle);
  const [selectedTier, setSelectedTier] = useState<"free" | "growth" | "enterprise" | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  
  // Checkout Form State (Simulated)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "qr" | "bank">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankTransactionId, setBankTransactionId] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 1500);
  };

  if (!isOpen) return null;

  const handleSelectPlan = (tier: "free" | "growth" | "enterprise") => {
    const isCurrentPlanActive = subscription.tier === tier && (tier === "free" || subscription.billingCycle === billingCycle);
    if (isCurrentPlanActive) {
      alert(`You are already subscribed to the ${TIER_DETAILS[tier].name} (${billingCycle}) plan.`);
      return;
    }
    
    if (tier === "free") {
      // Free is instant
      onUpdateSubscription({
        tier: "free",
        billingCycle,
        status: "active"
      });
      return;
    }

    setSelectedTier(tier);
    setCheckoutModalOpen(true);
    setCheckoutSuccess(false);
    setPaymentMethod("card");
    setUpiId("");
    setBankTransactionId("");
    setCopiedField(null);
  };

  const handleSimulateCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    setIsProcessingCheckout(true);

    setTimeout(() => {
      setIsProcessingCheckout(false);
      setCheckoutSuccess(true);

      setTimeout(() => {
        // Calculate dynamic expiry date based on current system time
        const expiry = (() => {
          const d = new Date();
          if (billingCycle === "yearly") {
            d.setFullYear(d.getFullYear() + 1);
          } else {
            d.setMonth(d.getMonth() + 1);
          }
          return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        })();

        onUpdateSubscription({
          tier: selectedTier,
          billingCycle,
          status: "active",
          expiryDate: expiry
        });
        setCheckoutModalOpen(false);
        setSelectedTier(null);
        setCardNumber("");
        setCardName("");
        setCardExpiry("");
        setCardCvc("");
        setUpiId("");
        setBankTransactionId("");
      }, 1500);

    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-6xl w-full shadow-2xl relative my-8 animate-scale-in text-slate-800">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition p-2 rounded-full hover:bg-slate-100 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-10 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
              <Gift className="w-3.5 h-3.5 animate-bounce" />
              Upgrade SentioPoint Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Unlock professional topic modeling diagnostics, competitor benchmarking comparisons, and advanced real-time active alert rules.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl mt-6 border border-slate-200">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-tight transition ${
                  billingCycle === "monthly" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-tight transition flex items-center gap-1.5 ${
                  billingCycle === "yearly" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Yearly Billing
                <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {(Object.keys(TIER_DETAILS) as Array<"free" | "growth" | "enterprise">).map((key) => {
              const tier = TIER_DETAILS[key];
              const price = billingCycle === "yearly" ? tier.priceYearly : tier.priceMonthly;
              const isActive = subscription.tier === key && (key === "free" || subscription.billingCycle === billingCycle);
              const isSameTierDifferentBilling = subscription.tier === key && key !== "free" && subscription.billingCycle !== billingCycle;
              const IconComp = tier.icon;

              return (
                <div 
                  key={key} 
                  className={`relative rounded-3xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                    isActive 
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/5" 
                      : isSameTierDifferentBilling
                      ? "border-indigo-400 ring-1 ring-indigo-400/20 bg-indigo-50/5"
                      : tier.popular
                      ? "border-indigo-500 ring-1 ring-indigo-500/30 shadow-md scale-102 lg:scale-105"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {/* Popular Tag */}
                  {tier.popular && !isActive && !isSameTierDifferentBilling && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                      Most Popular
                    </span>
                  )}

                  {/* Active Plan Tag */}
                  {isActive && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Current Plan
                    </span>
                  )}

                  {/* Same Tier Different Billing Tag */}
                  {isSameTierDifferentBilling && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Zap className="w-3.5 h-3.5" />
                      Active ({subscription.billingCycle})
                    </span>
                  )}

                  {/* Tier info */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-2 rounded-lg ${
                        key === "free" ? "bg-slate-100 text-slate-600" :
                        key === "growth" ? "bg-indigo-50 text-indigo-600" :
                        "bg-purple-50 text-purple-600"
                      }`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{tier.name}</h3>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      {tier.desc}
                    </p>

                    {/* Price display */}
                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                        ${price}
                      </span>
                      <span className="text-slate-400 text-xs font-semibold">
                        / {billingCycle === "yearly" ? "month, billed annually" : "month"}
                      </span>
                    </div>

                    {/* Features list */}
                    <div className="space-y-4 mb-8">
                      {/* Unlocked */}
                      {tier.features.map((feat, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start text-xs">
                          <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </div>
                          <span className="text-slate-600 font-medium leading-normal">{feat}</span>
                        </div>
                      ))}

                      {/* Locked */}
                      {tier.lockedFeatures.map((feat, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start text-xs opacity-50 select-none">
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="text-slate-400 line-through font-medium leading-normal">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(key)}
                    disabled={isActive}
                    className={`w-full py-3 rounded-2xl text-xs font-extrabold tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-slate-100 text-slate-500 cursor-default"
                        : isSameTierDifferentBilling
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                        : key === "growth"
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {isActive 
                      ? "Active Plan" 
                      : isSameTierDifferentBilling 
                      ? `Switch to ${billingCycle === "yearly" ? "Yearly" : "Monthly"}` 
                      : `Upgrade to ${tier.name}`
                    }
                    {!isActive && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 mt-10 text-xs text-slate-500 leading-relaxed">
            <Info className="w-5 h-5 text-indigo-500 shrink-0" />
            <p>
              SentioPoint AI billing transactions are completely simulated inside your local sandbox. No real charges or credit cards are involved. Enjoy risk-free upgrades and unlock advanced analysis vectors instantly!
            </p>
          </div>
        </div>
      </div>

      {/* SIMULATED CHECKOUT MODAL */}
      {checkoutModalOpen && selectedTier && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden relative animate-scale-in text-slate-800">
            
            {/* Header / Brand */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="text-sm font-bold tracking-tight">Secure Sandbox Checkout</h3>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            {checkoutSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center animate-bounce">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Subscription Provisioned!</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Your sandbox credentials have been verified. Standard and advanced features are compiling in your developer logs.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSimulateCheckout} className="p-6 space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-indigo-950">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 animate-pulse" />
                  <div>
                    <span className="font-bold">Sandbox checkout simulation:</span> You are subscribing to the <strong className="text-indigo-700">{TIER_DETAILS[selectedTier].name}</strong> plan for <strong>${billingCycle === "yearly" ? TIER_DETAILS[selectedTier].priceYearly : TIER_DETAILS[selectedTier].priceMonthly}/{billingCycle === "yearly" ? "mo" : "mo"}</strong>.
                  </div>
                </div>

                 {/* Tab Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-2 rounded-lg text-[11px] font-bold tracking-tight transition flex items-center justify-center gap-1 cursor-pointer ${
                      paymentMethod === "card"
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`py-2 rounded-lg text-[11px] font-bold tracking-tight transition flex items-center justify-center gap-1 cursor-pointer ${
                      paymentMethod === "upi"
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    UPI ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("qr")}
                    className={`py-2 rounded-lg text-[11px] font-bold tracking-tight transition flex items-center justify-center gap-1 cursor-pointer ${
                      paymentMethod === "qr"
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`py-2 rounded-lg text-[11px] font-bold tracking-tight transition flex items-center justify-center gap-1 cursor-pointer ${
                      paymentMethod === "bank"
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    Bank Transfer
                  </button>
                </div>

                {/* Input Fields based on Payment Method */}
                {paymentMethod === "card" && (
                  <div className="space-y-3.5 animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === "card"}
                        placeholder="e.g., Jane Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required={paymentMethod === "card"}
                          maxLength={19}
                          placeholder="4111 1111 1111 1111"
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "").replace(/(.{4})/g, "$1 ").trim();
                            setCardNumber(val);
                          }}
                          className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 pl-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required={paymentMethod === "card"}
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9]/g, "");
                            if (val.length >= 2) {
                              val = val.substring(0, 2) + "/" + val.substring(2, 4);
                            }
                            setCardExpiry(val);
                          }}
                          className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          required={paymentMethod === "card"}
                          maxLength={3}
                          placeholder="•••"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ""))}
                          className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div className="space-y-3.5 animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Enter UPI ID / Virtual Payment Address
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required={paymentMethod === "upi"}
                          placeholder="e.g., username@oksbi"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 pl-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                        <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                        Your UPI ID is usually yourphone-number@upi or username@okaxis.
                      </p>
                    </div>

                    {/* Quick suffixes */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["@okaxis", "@oksbi", "@paytm", "@apl", "@ybl"].map((suffix) => (
                        <button
                          key={suffix}
                          type="button"
                          onClick={() => {
                            const base = upiId.split("@")[0] || "user";
                            setUpiId(base + suffix);
                          }}
                          className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-[10px] font-medium text-slate-600 hover:text-indigo-700 transition cursor-pointer"
                        >
                          {suffix}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === "qr" && (
                  <div className="text-center py-4 space-y-4 animate-fade-in">
                    <div className="relative inline-block">
                      {/* Our beautiful SVG QR Code */}
                      <svg viewBox="0 0 100 100" className="w-36 h-36 mx-auto border border-slate-200 p-2 bg-white rounded-2xl shadow-sm">
                        {/* Locators */}
                        <rect x="0" y="0" width="30" height="30" fill="none" stroke="#0f172a" strokeWidth="6" />
                        <rect x="8" y="8" width="14" height="14" fill="#0f172a" />
                        
                        <rect x="70" y="0" width="30" height="30" fill="none" stroke="#0f172a" strokeWidth="6" />
                        <rect x="78" y="8" width="14" height="14" fill="#0f172a" />

                        <rect x="0" y="70" width="30" height="30" fill="none" stroke="#0f172a" strokeWidth="6" />
                        <rect x="8" y="78" width="14" height="14" fill="#0f172a" />

                        {/* Data points */}
                        <rect x="35" y="5" width="8" height="8" fill="#334155" />
                        <rect x="45" y="15" width="8" height="8" fill="#334155" />
                        <rect x="55" y="5" width="8" height="8" fill="#334155" />
                        <rect x="35" y="25" width="8" height="8" fill="#334155" />
                        <rect x="45" y="35" width="8" height="8" fill="#334155" />
                        <rect x="15" y="45" width="8" height="8" fill="#334155" />
                        <rect x="25" y="55" width="8" height="8" fill="#334155" />
                        <rect x="55" y="45" width="8" height="8" fill="#334155" />
                        <rect x="65" y="35" width="8" height="8" fill="#334155" />
                        <rect x="85" y="45" width="8" height="8" fill="#334155" />
                        <rect x="75" y="55" width="8" height="8" fill="#334155" />
                        <rect x="35" y="75" width="8" height="8" fill="#334155" />
                        <rect x="45" y="85" width="8" height="8" fill="#334155" />
                        <rect x="55" y="75" width="8" height="8" fill="#334155" />
                        <rect x="85" y="85" width="8" height="8" fill="#334155" />
                        <rect x="75" y="75" width="8" height="8" fill="#334155" />
                        
                        <rect x="40" y="40" width="20" height="20" fill="#4f46e5" rx="3" />
                        <path d="M46,50 L54,50 M50,46 L50,54" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-md border border-slate-100 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-indigo-600" />
                      </div>
                    </div>

                    <div className="max-w-xs mx-auto space-y-1">
                      <h4 className="text-xs font-bold text-slate-800">Scan QR to pay with UPI</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Compatible with GPay, PhonePe, Paytm, BHIM, and other UPI apps.
                      </p>
                    </div>

                    {/* Simulated live scanner pulse indicator */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Awaiting QR scanner confirmation...</span>
                    </div>
                  </div>
                )}

                {paymentMethod === "bank" && (
                  <div className="space-y-4 animate-fade-in text-slate-700">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-900 leading-normal flex gap-2.5">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        Please transfer the subscription amount to the bank account listed below, then click <strong>Verify & Confirm Bank Transfer</strong> below to activate your plan.
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl bg-slate-50 p-4 space-y-3">
                      {/* Bank name */}
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bank Name</span>
                        <span className="text-xs font-bold text-slate-800">State bank of India</span>
                      </div>

                      {/* Account Number */}
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account Number</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-slate-800 tracking-wider">38578172867</span>
                          <button
                            type="button"
                            onClick={() => handleCopy("38578172867", "account")}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition relative cursor-pointer"
                            title="Copy Account Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copiedField === "account" && (
                              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm font-sans whitespace-nowrap">
                                Copied!
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* IFSC Code */}
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">IFSC Code</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-slate-800 tracking-wider">SBIN0010080</span>
                          <button
                            type="button"
                            onClick={() => handleCopy("SBIN0010080", "ifsc")}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition relative cursor-pointer"
                            title="Copy IFSC Code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copiedField === "ifsc" && (
                              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm font-sans whitespace-nowrap">
                                Copied!
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Payment Amount */}
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Exact Amount Due</span>
                        <span className="text-sm font-extrabold text-indigo-700">
                          ${billingCycle === "yearly" ? TIER_DETAILS[selectedTier].priceYearly * 12 : TIER_DETAILS[selectedTier].priceMonthly}
                          <span className="text-[10px] font-normal text-slate-400"> ({billingCycle === "yearly" ? "Billed Annually" : "Monthly"})</span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Reference / Transaction ID (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter bank transfer reference or UTR number"
                        value={bankTransactionId}
                        onChange={(e) => setBankTransactionId(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                      <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                        Provide the UTR or Reference Number from your netbanking app to expedite offline sandbox confirmation.
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 text-center flex items-center gap-1.5 justify-center mt-2 bg-slate-50 p-2 rounded-lg border border-dashed border-slate-200">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Sandbox checkout does not send real payment data to external servers.</span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isProcessingCheckout}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2"
                >
                  {isProcessingCheckout ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Validating Sandbox Transaction...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      {paymentMethod === "card" 
                        ? "Complete Payment Simulation" 
                        : paymentMethod === "upi"
                        ? "Verify & Complete UPI ID Payment"
                        : paymentMethod === "qr"
                        ? "Simulate Scan & Complete Payment"
                        : "Verify & Confirm Bank Transfer"
                      }
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
