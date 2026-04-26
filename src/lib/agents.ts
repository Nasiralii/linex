import OpenAI from "openai";

// ============================================================================
// LineX-Forsa AI Agents — All 11 Agents (Bilingual AR/EN)
// ============================================================================

let _openai: OpenAI | null = null;
function ai(): OpenAI {
  if (!_openai)
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
  return _openai;
}

const PLATFORM_CONTEXT = `Rasi (راسي) is a trusted construction marketplace platform in Saudi Arabia.
It connects project owners with verified contractors and engineers.
Features: project posting, bidding, AI matching, Krasat (100 SAR project unlock), supervision services, digital contracts.
Three project types: Design Only, Construction Only, Design + Construction.
Four user roles: Project Owner, Contractor, Engineer (Designer/Supervisor), Admin.
All prices in SAR (Saudi Riyal). Platform serves the Saudi construction market.`;

// ============================================================================
// Agent 1: Customer Support RAG Chatbot
// ============================================================================
export async function customerSupportAgent(
  message: string,
  locale: string = "ar",
  history: { role: string; content: string }[] = [],
) {
  const lang = locale === "ar" ? "Arabic" : "English";
  const res = await ai().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.5,
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: `You are the customer support agent for LineX-Forsa construction marketplace. Respond in ${lang}.
${PLATFORM_CONTEXT}
FAQ:
- Registration is free for all roles (Owner, Contractor, Engineer)
- Krasat costs 100 SAR to unlock full project details
- Supervision request costs 100 SAR (owner) + 500 SAR engineer wallet deposit
- Professional contracts cost 150 SAR, simple contracts are free
- AI ranks bids on: Price (30%), Rating (25%), Timeline (20%), Experience (15%), Response Speed (10%)
- Projects go through: Draft → Pending Review → Published → Bidding → Awarded
- Contractors must be verified before bidding
- 30-day default bidding window
Be helpful, professional, and concise. If you don't know the answer, suggest contacting support.`,
      },
      ...history.map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ],
  });
  return res.choices[0]?.message?.content || "";
}

// ============================================================================
// Agent 2: Construction Project Intake Chatbot
// ============================================================================
export async function projectIntakeAgent(
  message: string,
  locale: string = "ar",
  history: { role: string; content: string }[] = [],
) {
  const lang = locale === "ar" ? "Arabic" : "English";
  const res = await ai().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 800,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a construction project intake consultant for LineX-Forsa. Respond in ${lang}.
Guide the user step by step to define their project. Ask about: type of work, location, budget, timeline, specific requirements.
When you have enough info, return JSON with:
{ "ready": true, "project": { "title": "", "titleAr": "", "description": "", "descriptionAr": "", "projectType": "CONSTRUCTION_ONLY|DESIGN_ONLY|DESIGN_AND_CONSTRUCTION", "suggestedCategory": "", "budgetMin": 0, "budgetMax": 0, "estimatedDuration": "" }, "message": "conversation response" }
If still gathering info: { "ready": false, "message": "your question to the user" }`,
      },
      ...history.map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ],
  });
  try {
    return JSON.parse(res.choices[0]?.message?.content || "{}");
  } catch {
    return { ready: false, message: res.choices[0]?.message?.content || "" };
  }
}

// ============================================================================
// Agent 3: Smart Bid Evaluator
// ============================================================================
export async function bidEvaluatorAgent(
  projectTitle: string,
  bids: any[],
  locale: string = "ar",
) {
  const lang = locale === "ar" ? "Arabic" : "English";
  const res = await ai().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a construction bid evaluation expert. Analyze bids and provide recommendations in ${lang}.
Return JSON: { "recommendation": "top bid ID", "analysis": "detailed comparison", "risks": ["risk1"], "ranking": [{"bidId": "", "score": 0, "reason": ""}] }`,
      },
      {
        role: "user",
        content: JSON.stringify({ project: projectTitle, bids }),
      },
    ],
  });
  try {
    return JSON.parse(res.choices[0]?.message?.content || "{}");
  } catch {
    return { analysis: res.choices[0]?.message?.content };
  }
}

// ============================================================================
// Agent 4: Admin Intelligence Agent
// ============================================================================
export async function adminIntelligenceAgent(
  stats: any,
  locale: string = "ar",
) {
  const lang = locale === "ar" ? "Arabic" : "English";
  const res = await ai().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an admin intelligence analyst for LineX-Forsa construction marketplace. Respond in ${lang}.
Analyze platform stats and provide actionable insights.
Return JSON: { "summary": "brief overview", "insights": ["insight1"], "alerts": ["alert1"], "recommendations": ["rec1"] }`,
      },
      { role: "user", content: JSON.stringify(stats) },
    ],
  });
  try {
    return JSON.parse(res.choices[0]?.message?.content || "{}");
  } catch {
    return { summary: res.choices[0]?.message?.content };
  }
}

// ============================================================================
// Agent 5: Outreach & Engagement Agent
// ============================================================================
export async function outreachAgent(
  project: any,
  contractor: any,
  locale: string = "ar",
) {
  const lang = locale === "ar" ? "Arabic" : "English";
  const res = await ai().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 300,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Generate a personalized outreach message for a contractor/engineer about a new matching project on LineX-Forsa. 
Return JSON: { "subject": "", "subjectAr": "", "message": "", "messageAr": "", "whatsappMessage": "", "whatsappMessageAr": "" }
Keep it professional, concise, and include a call-to-action. Mention the project name, location, and budget range.`,
      },
      { role: "user", content: JSON.stringify({ project, contractor }) },
    ],
  });
  try {
    return JSON.parse(res.choices[0]?.message?.content || "{}");
  } catch {
    return {};
  }
}

// ============================================================================
// Agent 6: Contract Drafting Agent
// ============================================================================
export async function contractDraftingAgent(
  project: any,
  bid: any,
  contractType: string = "SIMPLE",
  locale: string = "ar",
) {
  const lang = locale === "ar" ? "Arabic" : "English";
  const res = await ai().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a construction contract drafting specialist for Saudi Arabia. Respond in ${lang}.
Draft a ${contractType === "PROFESSIONAL" ? "comprehensive professional" : "simple standard"} construction contract.
Return JSON: { "contractTitle": "", "contractTitleAr": "", "terms": "full contract text", "termsAr": "Arabic version", "keyTerms": ["term1"], "keyTermsAr": ["term1 in Arabic"] }
Include: parties, scope of work, timeline, payment terms, quality standards, dispute resolution. Use Saudi Arabian legal standards.`,
      },
      { role: "user", content: JSON.stringify({ project, bid, contractType }) },
    ],
  });
  try {
    return JSON.parse(res.choices[0]?.message?.content || "{}");
  } catch {
    return { terms: res.choices[0]?.message?.content };
  }
}

// ============================================================================
// Agent 7: Bid Writing Assistant
// ============================================================================
export async function bidWritingAgent(
  projectDetails: any,
  contractorProfile: any,
  locale: string = "ar",
) {
  const lang = locale === "ar" ? "Arabic" : "English";
  const res = await ai().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a bid writing consultant for construction contractors in Saudi Arabia. Respond in ${lang}.
Help write a compelling, professional bid proposal.
Return JSON: { "proposalText": "", "proposalTextAr": "", "suggestedPrice": 0, "suggestedTimeline": 0, "tips": ["tip1"], "tipsAr": ["tip1 Arabic"] }`,
      },
      {
        role: "user",
        content: JSON.stringify({
          project: projectDetails,
          contractor: contractorProfile,
        }),
      },
    ],
  });
  try {
    return JSON.parse(res.choices[0]?.message?.content || "{}");
  } catch {
    return { proposalText: res.choices[0]?.message?.content };
  }
}

// ============================================================================
// Agent 8: Document Verification Agent
// ============================================================================
export async function documentVerificationAgent(
  documentType: string,
  documentText: string,
  locale: string = "ar",
) {
  const lang = locale === "ar" ? "Arabic" : "English";
  const res = await ai().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a document verification specialist for a Saudi Arabian construction marketplace. Respond in ${lang}.
Analyze the submitted document and provide verification assessment.
Return JSON: { "isValid": true/false, "confidence": 0-100, "documentType": "", "findings": ["finding1"], "findingsAr": ["finding1 Arabic"], "recommendations": "", "recommendationsAr": "", "redFlags": ["flag1"] }`,
      },
      {
        role: "user",
        content: JSON.stringify({ type: documentType, content: documentText }),
      },
    ],
  });
  try {
    return JSON.parse(res.choices[0]?.message?.content || "{}");
  } catch {
    return { isValid: false, confidence: 0, findings: ["Unable to analyze"] };
  }
}

// ============================================================================
// Agent 9: Price Estimation Agent
// ============================================================================
export async function priceEstimationAgent(
  projectDescription: string,
  locale: string = "ar",
) {
  const lang = locale === "ar" ? "Arabic" : "English";
  const res = await ai().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a construction cost estimation expert for Saudi Arabia. Respond in ${lang}.
Estimate project costs based on current Saudi market rates (2024-2026).
Return JSON: { "estimatedMin": 0, "estimatedMax": 0, "currency": "SAR", "breakdown": [{"item": "", "itemAr": "", "cost": 0}], "confidence": "low|medium|high", "notes": "", "notesAr": "" }
Be realistic with Saudi Arabia pricing. Consider material costs, labor, location premiums.`,
      },
      { role: "user", content: projectDescription },
    ],
  });
  try {
    return JSON.parse(res.choices[0]?.message?.content || "{}");
  } catch {
    return { estimatedMin: 0, estimatedMax: 0, confidence: "low" };
  }
}

// ============================================================================
// Agent 10: Review Sentiment Agent
// ============================================================================
export async function reviewSentimentAgent(
  reviews: any[],
  locale: string = "ar",
) {
  const lang = locale === "ar" ? "Arabic" : "English";
  const res = await ai().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a review analysis specialist. Respond in ${lang}.
Analyze construction marketplace reviews for sentiment, authenticity, and key themes.
Return JSON: { "overallSentiment": "positive|neutral|negative", "sentimentScore": 0-100, "summary": "", "summaryAr": "", "themes": ["theme1"], "themesAr": ["theme1 Arabic"], "suspiciousReviews": [{"reviewId": "", "reason": ""}], "reputationSummary": "", "reputationSummaryAr": "" }`,
      },
      { role: "user", content: JSON.stringify(reviews) },
    ],
  });
  try {
    return JSON.parse(res.choices[0]?.message?.content || "{}");
  } catch {
    return { overallSentiment: "neutral", sentimentScore: 50 };
  }
}

// ============================================================================
// Agent 11: Platform Marketing Agent (Social Media)
// ============================================================================
export async function marketingAgent(request: {
  type:
    | "instagram_post"
    | "instagram_story"
    | "twitter"
    | "linkedin"
    | "facebook"
    | "campaign";
  topic: string;
  locale: string;
}) {
  const lang = request.locale === "ar" ? "Arabic" : "English";
  const res = await ai().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.8,
    max_tokens: 1500,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a social media marketing expert for Rasi (راسي), a premium construction marketplace in Saudi Arabia. Respond in ${lang}.
${PLATFORM_CONTEXT}
Brand voice: Professional, trustworthy, innovative, construction-focused. Use construction industry terminology.
Return JSON based on content type:
For instagram_post: { "caption": "", "captionAr": "", "hashtags": [], "hashtagsAr": [], "imagePrompt": "", "bestPostTime": "", "engagement_tips": [] }
For instagram_story: { "slides": [{"text": "", "textAr": "", "imagePrompt": ""}], "callToAction": "", "callToActionAr": "" }
For twitter: { "tweet": "", "tweetAr": "", "hashtags": [], "thread": [{"text": "", "textAr": ""}] }
For linkedin: { "post": "", "postAr": "", "headline": "", "headlineAr": "" }
For facebook: { "post": "", "postAr": "", "headline": "", "headlineAr": "" }
For campaign: { "campaignName": "", "campaignNameAr": "", "objective": "", "targetAudience": "", "platforms": [], "contentCalendar": [{"day": "", "platform": "", "content": "", "contentAr": ""}], "kpis": [] }`,
      },
      { role: "user", content: JSON.stringify(request) },
    ],
  });
  try {
    return JSON.parse(res.choices[0]?.message?.content || "{}");
  } catch {
    return { error: "Failed to generate content" };
  }
}
