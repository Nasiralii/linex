import OpenAI from "openai";

export type BidRankingConfidence = "low" | "medium" | "high";

export interface BidRankingInput {
  bid: {
    id: string;
    amount: number | null;
    estimatedDuration: number | null;
    proposalText: string | null;
    submittedAt: Date | null;
    aiScore?: number | null;
    contractor: {
      id?: string;
      companyName?: string | null;
      companyNameAr?: string | null;
      ratingAverage?: number | null;
      reviewCount?: number | null;
      yearsInBusiness?: number | null;
      yearsExperience?: number | null;
      verificationStatus?: string | null;
      website?: string | null;
      teamSize?: number | null;
      specialization?: string | null;
      profileComplete?: boolean | null;
      documentsCount?: number;
      portfolioCount?: number;
    };
  };
  project: {
    id: string;
    title: string;
    titleAr?: string | null;
    description?: string | null;
    descriptionAr?: string | null;
    budgetMin?: number | null;
    budgetMax?: number | null;
    projectType?: string | null;
    publishedAt?: Date | null;
  };
}

export interface RankedBidResult {
  eligible: boolean;
  blockedReason?: string;
  totalScore: number;
  priceScore: number;
  ratingScore: number;
  timelineScore: number;
  experienceScore: number;
  responseScore: number;
  confidence: BidRankingConfidence;
  explanationsEn: string[];
  explanationsAr: string[];
  warnings: string[];
  missingCoreFields: string[];
  usedFallbacks: string[];
}

export interface StoredBidRankingSnapshot {
  totalScore: number;
  confidence: BidRankingConfidence;
  missingCoreFields: string[];
  usedFallbacks: string[];
  explanationsEn: string[];
  explanationsAr: string[];
}

export const BID_RANKING_SNAPSHOT_TTL_MS = 6 * 60 * 60 * 1000;

let _openai: OpenAI | null = null;

function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
  }
  return _openai;
}

function scorePrice(amount: number | null, budgetMin?: number | null, budgetMax?: number | null) {
  if (!amount || !budgetMin || !budgetMax) return 50;
  const midpoint = (budgetMin + budgetMax) / 2;
  const deviation = Math.abs(amount - midpoint) / Math.max(midpoint, 1);
  let score = Math.max(10, 100 - deviation * 100);
  if (amount >= budgetMin && amount <= budgetMax) score = Math.max(score, 75);
  return Math.round(Math.min(100, score));
}

function scoreRating(ratingAverage?: number | null, reviewCount?: number | null) {
  if (!reviewCount || reviewCount === 0) {
    return { score: 55, fallback: true };
  }
  const rating = ratingAverage || 0;
  return { score: Math.round(Math.min(100, (rating / 5) * 100)), fallback: false };
}

function scoreTimeline(estimatedDuration: number | null) {
  if (!estimatedDuration) return { score: 0, missing: true };
  const score = Math.max(20, Math.min(100, 100 - (estimatedDuration / 365) * 100));
  return { score: Math.round(score), missing: false };
}

function scoreExperience(input: BidRankingInput) {
  const years = input.bid.contractor.yearsInBusiness || input.bid.contractor.yearsExperience || 0;
  const docs = input.bid.contractor.documentsCount || 0;
  const portfolio = input.bid.contractor.portfolioCount || 0;
  let score = Math.min(60, years * 8) + Math.min(20, docs * 4) + Math.min(20, portfolio * 5);
  const fallback = years === 0 && docs === 0 && portfolio === 0;
  if (fallback) score = 35;
  return { score: Math.min(100, Math.round(score)), fallback };
}

function scoreResponse(submittedAt: Date | null, publishedAt?: Date | null) {
  if (!submittedAt || !publishedAt) return { score: 45, fallback: true };
  const hours = (new Date(submittedAt).getTime() - new Date(publishedAt).getTime()) / (1000 * 60 * 60);
  const score = Math.max(20, Math.min(100, 100 - (hours / 72) * 100));
  return { score: Math.round(score), fallback: false };
}

async function getAiQualitativeAssessment(input: BidRankingInput) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      proposalQualityScore: 60,
      experienceRelevanceScore: 55,
      timelineRealismScore: 55,
      evidenceStrengthScore: 50,
      confidence: "medium" as BidRankingConfidence,
      explanationsEn: ["AI unavailable, conservative fallback used."],
      explanationsAr: ["تعذر استخدام الذكاء الاصطناعي، وتم استخدام تقييم تحفظي."],
      warnings: ["ai_unavailable"],
    };
  }

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an institutional construction bid analyst working under a strict scoring policy.
Return ONLY valid JSON with these fields:
{
  "proposalQualityScore": number,
  "experienceRelevanceScore": number,
  "timelineRealismScore": number,
  "evidenceStrengthScore": number,
  "confidence": "low|medium|high",
  "explanationsEn": string[],
  "explanationsAr": string[],
  "warnings": string[]
}

Rules:
- Never decide eligibility. The system does that separately.
- Scores must be 0-100.
- Be conservative if evidence is weak.
- Give short, professional explanations.
- Evaluate proposal clarity, relevance of experience, realism of duration, and evidence strength.
- Do not hallucinate unseen documents.`
      },
      {
        role: "user",
        content: JSON.stringify({
          project: input.project,
          bid: {
            amount: input.bid.amount,
            estimatedDuration: input.bid.estimatedDuration,
            proposalText: input.bid.proposalText,
            contractor: input.bid.contractor,
          },
        }),
      },
    ],
  });

  return JSON.parse(response.choices[0]?.message?.content || "{}");
}

export function extractStoredBidRankingSnapshot(metadata: any): StoredBidRankingSnapshot | null {
  if (!metadata || typeof metadata !== "object") return null;
  if (typeof metadata.totalScore !== "number") return null;
  return {
    totalScore: metadata.totalScore,
    confidence: metadata.confidence || "low",
    missingCoreFields: Array.isArray(metadata.missingCoreFields) ? metadata.missingCoreFields : [],
    usedFallbacks: Array.isArray(metadata.usedFallbacks) ? metadata.usedFallbacks : [],
    explanationsEn: Array.isArray(metadata.explanationsEn) ? metadata.explanationsEn : [],
    explanationsAr: Array.isArray(metadata.explanationsAr) ? metadata.explanationsAr : [],
  };
}

export function isStoredBidRankingSnapshotFresh(createdAt?: string | Date | null, ttlMs: number = BID_RANKING_SNAPSHOT_TTL_MS) {
  if (!createdAt) return false;
  const ts = new Date(createdAt).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= ttlMs;
}

export async function rankBidWithPolicy(input: BidRankingInput): Promise<RankedBidResult> {
  const missingCoreFields: string[] = [];
  const usedFallbacks: string[] = [];
  const warnings: string[] = [];

  if (!input.bid.amount) missingCoreFields.push("price");
  if (!input.bid.estimatedDuration) missingCoreFields.push("timeline");
  if (!input.bid.proposalText?.trim()) missingCoreFields.push("detailed_proposal");

  const verified = input.bid.contractor.verificationStatus === "VERIFIED";
  if (!verified) missingCoreFields.push("eligibility_verification");

  if (missingCoreFields.length > 0) {
    return {
      eligible: false,
      blockedReason: `Bid is incomplete or not eligible: ${missingCoreFields.join(", ")}`,
      totalScore: 0,
      priceScore: 0,
      ratingScore: 0,
      timelineScore: 0,
      experienceScore: 0,
      responseScore: 0,
      confidence: "low",
      explanationsEn: ["Bid blocked from ranking until core required elements are completed."],
      explanationsAr: ["تم حجب العرض من الترتيب إلى حين استكمال العناصر الأساسية المطلوبة."],
      warnings,
      missingCoreFields,
      usedFallbacks,
    };
  }

  const priceScore = scorePrice(input.bid.amount, input.project.budgetMin, input.project.budgetMax);
  const rating = scoreRating(input.bid.contractor.ratingAverage, input.bid.contractor.reviewCount);
  if (rating.fallback) usedFallbacks.push("rating_history_neutral_fallback");

  const timeline = scoreTimeline(input.bid.estimatedDuration);
  const experience = scoreExperience(input);
  if (experience.fallback) usedFallbacks.push("experience_conservative_fallback");

  const response = scoreResponse(input.bid.submittedAt, input.project.publishedAt);
  if (response.fallback) usedFallbacks.push("response_speed_neutral_fallback");

  const ai = await getAiQualitativeAssessment(input);
  if ((ai.warnings || []).length > 0) warnings.push(...ai.warnings);

  const ratingScore = Math.round(rating.score * 0.6 + (ai.evidenceStrengthScore || 50) * 0.4);
  const timelineScore = Math.round(timeline.score * 0.6 + (ai.timelineRealismScore || 50) * 0.4);
  const experienceScore = Math.round(experience.score * 0.55 + (ai.experienceRelevanceScore || 50) * 0.45);
  const responseScore = response.score;

  const totalScore = Math.round(
    priceScore * 0.30 +
    ratingScore * 0.25 +
    timelineScore * 0.20 +
    experienceScore * 0.15 +
    responseScore * 0.10
  );

  const confidence = (ai.confidence || (usedFallbacks.length === 0 ? "high" : usedFallbacks.length <= 2 ? "medium" : "low")) as BidRankingConfidence;

  return {
    eligible: true,
    totalScore,
    priceScore,
    ratingScore,
    timelineScore,
    experienceScore,
    responseScore,
    confidence,
    explanationsEn: ai.explanationsEn || [],
    explanationsAr: ai.explanationsAr || [],
    warnings,
    missingCoreFields,
    usedFallbacks,
  };
}
