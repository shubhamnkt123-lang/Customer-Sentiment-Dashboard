export interface OverallSentiment {
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  satisfactionScore: number;
  totalAnalyzed: number;
}

export interface SentimentTrendPoint {
  period: string;
  positive: number;
  neutral: number;
  negative: number;
  averageScore: number;
}

export interface WordCloudItem {
  text: string;
  weight: number;
  sentiment: "positive" | "negative" | "neutral";
}

export interface ImprovementArea {
  title: string;
  description: string;
  impact: string;
  evidence: string;
}

export interface PraiseArea {
  title: string;
  description: string;
}

export interface ExecutiveSummary {
  overview: string;
  topImprovementAreas: ImprovementArea[];
  topPraises: PraiseArea[];
}

export interface AnalysisResult {
  overallSentiment: OverallSentiment;
  sentimentTrend: SentimentTrendPoint[];
  wordCloud: WordCloudItem[];
  executiveSummary: ExecutiveSummary;
  topics: TopicModelItem[];
}

export interface TopicModelItem {
  name: string;
  count: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  keyFeedbackSample: string;
}

export interface AlertRule {
  id: string;
  name: string;
  type: "sentiment" | "keyword" | "volume";
  thresholdValue: string; // e.g., "<70" for satisfaction, "sluggish,bug,error" for keyword, ">100" for volume
  isActive: boolean;
  description: string;
}

export interface TriggeredAlert {
  id: string;
  ruleId: string;
  name: string;
  severity: "high" | "medium" | "low";
  message: string;
  timestamp: string;
  details: string;
}

export interface CompetitorAnalysis {
  competitorName: string;
  overallSentiment: OverallSentiment;
  strengths: string[];
  weaknesses: string[];
  comparisonSummary: string;
}

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface UserSubscription {
  tier: "free" | "growth" | "enterprise";
  billingCycle: "monthly" | "yearly";
  status: "active" | "trial" | "unsubscribed";
  expiryDate?: string;
}


