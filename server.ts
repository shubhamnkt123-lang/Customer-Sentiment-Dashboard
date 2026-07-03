import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize GoogleGenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// JSON Schema for review analysis
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallSentiment: {
      type: Type.OBJECT,
      properties: {
        positiveCount: { type: Type.INTEGER },
        neutralCount: { type: Type.INTEGER },
        negativeCount: { type: Type.INTEGER },
        satisfactionScore: { 
          type: Type.INTEGER, 
          description: "An overall score out of 100 representing customer satisfaction." 
        },
        totalAnalyzed: { type: Type.INTEGER }
      },
      required: ["positiveCount", "neutralCount", "negativeCount", "satisfactionScore", "totalAnalyzed"]
    },
    sentimentTrend: {
      type: Type.ARRAY,
      description: "An ordered series of 5 to 8 periods illustrating sentiment trend over time.",
      items: {
        type: Type.OBJECT,
        properties: {
          period: { type: Type.STRING, description: "Label like 'Week 1', 'Month 1' or specific date range." },
          positive: { type: Type.INTEGER },
          neutral: { type: Type.INTEGER },
          negative: { type: Type.INTEGER },
          averageScore: { type: Type.INTEGER, description: "Average rating/sentiment score for this period (0 to 100)" }
        },
        required: ["period", "positive", "neutral", "negative", "averageScore"]
      }
    },
    wordCloud: {
      type: Type.ARRAY,
      description: "Top 15-20 keywords or short phrases representing customer complaints (negative) or praises (positive).",
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          weight: { type: Type.INTEGER, description: "Frequency or impact weight, between 1 and 10." },
          sentiment: { type: Type.STRING, description: "Must be 'positive' (praise), 'negative' (complaint), or 'neutral'" }
        },
        required: ["text", "weight", "sentiment"]
      }
    },
    executiveSummary: {
      type: Type.OBJECT,
      properties: {
        overview: { type: Type.STRING, description: "A highly-professional business overview of customer sentiment and main takeaways." },
        topImprovementAreas: {
          type: Type.ARRAY,
          description: "Exactly 3 critical, distinct, highly actionable areas for improvement based on complaints.",
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Brief, professional title for the improvement area." },
              description: { type: Type.STRING, description: "Detailed narrative explaining the exact pain points and direct suggestions on how to address them." },
              impact: { type: Type.STRING, description: "Expected improvement impact: High, Medium, Low." },
              evidence: { type: Type.STRING, description: "Examples or illustrative quotes from reviews supporting this." }
            },
            required: ["title", "description", "impact", "evidence"]
          }
        },
        topPraises: {
          type: Type.ARRAY,
          description: "Top 3 notable aspects customers love and praise.",
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        }
      },
      required: ["overview", "topImprovementAreas", "topPraises"]
    },
    topics: {
      type: Type.ARRAY,
      description: "An array of 3 to 6 identified main topics in the reviews (e.g. 'Customer Service', 'Product Quality', 'Price', 'Speed').",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          count: { type: Type.INTEGER, description: "Number of reviews discussing this topic" },
          positivePercentage: { type: Type.INTEGER, description: "Percentage of feedback for this topic that is positive (0 to 100)" },
          neutralPercentage: { type: Type.INTEGER, description: "Percentage of feedback for this topic that is neutral (0 to 100)" },
          negativePercentage: { type: Type.INTEGER, description: "Percentage of feedback for this topic that is negative (0 to 100)" },
          keyFeedbackSample: { type: Type.STRING, description: "A representative quote from the reviews for this topic" }
        },
        required: ["name", "count", "positivePercentage", "neutralPercentage", "negativePercentage", "keyFeedbackSample"]
      }
    }
  },
  required: ["overallSentiment", "sentimentTrend", "wordCloud", "executiveSummary", "topics"]
};

// JSON Schema for competitor comparison
const competitorSchema = {
  type: Type.OBJECT,
  properties: {
    competitorName: { type: Type.STRING },
    overallSentiment: {
      type: Type.OBJECT,
      properties: {
        positiveCount: { type: Type.INTEGER },
        neutralCount: { type: Type.INTEGER },
        negativeCount: { type: Type.INTEGER },
        satisfactionScore: { type: Type.INTEGER, description: "Competitor satisfaction score out of 100." },
        totalAnalyzed: { type: Type.INTEGER }
      },
      required: ["positiveCount", "neutralCount", "negativeCount", "satisfactionScore", "totalAnalyzed"]
    },
    strengths: {
      type: Type.ARRAY,
      description: "List of exactly 3 major strengths or advantages of this competitor based on their reviews.",
      items: { type: Type.STRING }
    },
    weaknesses: {
      type: Type.ARRAY,
      description: "List of exactly 3 major weaknesses or customer complaints about this competitor based on their reviews.",
      items: { type: Type.STRING }
    },
    comparisonSummary: {
      type: Type.STRING,
      description: "A highly professional, comparative summary highlighting key differences and similarities between our product's performance and the competitor's, offering strategic suggestions."
    }
  },
  required: ["competitorName", "overallSentiment", "strengths", "weaknesses", "comparisonSummary"]
};

// POST: Analyze reviews
app.post("/api/analyze", async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviews, focusArea } = req.body;

    if (!reviews || typeof reviews !== "string" || reviews.trim().length === 0) {
      res.status(400).json({ error: "No reviews provided for analysis." });
      return;
    }

    const focusInstruction = focusArea
      ? `\nFocus your analysis and actionable improvements especially on: "${focusArea}".`
      : "";

    const userPrompt = `Analyze the following customer reviews. Extract structural metrics, sentiment trend, top keywords for a word cloud, perform topic modeling to categorize reviews into 3-6 distinct themes with their counts and positive/neutral/negative sentiment ratios, and write a high-level business executive summary with exactly 3 actionable areas for improvement and top praises.
    
    If the reviews don't contain explicit dates or timelines, chronologically sequence them based on their order of appearance to form 5 to 8 periods (e.g. "Period 1", "Period 2" etc. or divide them into weeks) to create a plausible sentiment trend line.
    
    Reviews to analyze:
    """
    ${reviews}
    """
    ${focusInstruction}`;

    // Use gemini-3.5-flash for rapid, cost-effective structured sentiment analysis
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: "You are a world-class Customer Sentiment Analyst and Business Strategist. Your output must be extremely detailed, objective, and strictly compliant with the requested JSON schema. Do not make up facts; extract insights directly from the customer comments.",
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini analysis model.");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error?.message || "Internal server error during analysis." });
  }
});

// POST: Compare reviews with competitor
app.post("/api/compare", async (req: Request, res: Response): Promise<void> => {
  try {
    const { competitorName, myReviewsSummary, competitorReviews } = req.body;

    if (!competitorReviews || typeof competitorReviews !== "string" || competitorReviews.trim().length === 0) {
      res.status(400).json({ error: "No competitor reviews provided for comparison." });
      return;
    }

    const name = competitorName || "Competitor";

    const userPrompt = `You are performing a comparative sentiment analysis.
    Here is the summary/context of OUR product's sentiment analysis result (the user's product):
    """
    ${myReviewsSummary || "Overall satisfaction score and improvement categories are shown on our dashboard."}
    """

    Now, analyze the following reviews for our competitor named "${name}".
    Extract their sentiment metrics, identify exactly 3 competitor strengths, exactly 3 competitor weaknesses, and write a professional 2-paragraph comparative analysis highlighting our differences/similarities, highlighting our edge and actions we should take.
    
    Competitor reviews to analyze:
    """
    ${competitorReviews}
    """`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: "You are a world-class Competitive Analyst and Product Strategist. Your output must be highly professional and strictly comply with the requested JSON schema. Be highly descriptive and actionable.",
        responseMimeType: "application/json",
        responseSchema: competitorSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini competitor comparison model.");
    }

    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Comparison Error:", error);
    res.status(500).json({ error: error?.message || "Internal server error during competitor comparison." });
  }
});

// POST: Chat with advisor
app.post("/api/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, analysisContext, rawReviews } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid or missing chat messages history." });
      return;
    }

    // Format previous messages for Gemini API
    const geminiContents = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const systemInstruction = `You are a helpful, professional Customer Sentiment Advisor and Business Consultant.
You have access to the analyzed customer reviews dashboard data and raw reviews:

=== DASHBOARD RESULTS ===
Overall Satisfaction: ${analysisContext?.overallSentiment?.satisfactionScore || "N/A"}%
Positive Count: ${analysisContext?.overallSentiment?.positiveCount || 0}
Neutral Count: ${analysisContext?.overallSentiment?.neutralCount || 0}
Negative Count: ${analysisContext?.overallSentiment?.negativeCount || 0}

Top Actionable Areas:
${(analysisContext?.executiveSummary?.topImprovementAreas || [])
  .map((imp: any, i: number) => `${i + 1}. [${imp.impact} Impact] ${imp.title}: ${imp.description}`)
  .join("\n")}

Top Praises:
${(analysisContext?.executiveSummary?.topPraises || [])
  .map((praise: any, i: number) => `${i + 1}. ${praise.title}: ${praise.description}`)
  .join("\n")}

Raw Reviews Sample (first 5000 characters):
${rawReviews ? rawReviews.substring(0, 5000) : "No raw reviews provided."}

Help the user drill deeper into specific issues, draft customized response templates (e.g., support emails, public reviews response), devise strategic solutions for the 3 improvement areas, and suggest ways to capitalize on the positive features. Keep your answers concise, structured, professional, and action-oriented.`;

    // Use gemini-3.5-flash for faster chat replies
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: geminiContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error?.message || "Internal server error during chat." });
  }
});

// Serve frontend and handle routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
