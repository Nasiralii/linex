import OpenAI from "openai";

// ============================================================================
// AI Utility — OpenAI Integration for Rasi
// Lazy initialization to avoid build-time errors on Vercel
// ============================================================================

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
  }
  return _openai;
}

// ============================================================================
// AI Utilities for Rasi Construction Marketplace
// ============================================================================

// Policy-aligned profile quality score (0-100)
export function calculateProfileScore(profile: any): {
  score: number;
  badges: string[];
  tips: string[];
  confidence?: "low" | "medium" | "high";
  breakdown?: Record<string, number>;
} {
  const badges: string[] = [];
  const tips: string[] = [];
  const documentsCount = Array.isArray(profile?.documents)
    ? profile.documents.length
    : 0;
  const portfolioCount = Array.isArray(profile?.portfolioItems)
    ? profile.portfolioItems.length
    : 0;
  const years = profile?.yearsInBusiness || profile?.yearsExperience || 0;
  const rating = profile?.ratingAverage || 0;
  const reviews = profile?.reviewCount || 0;
  const isEngineer =
    profile?.specialization !== undefined ||
    profile?.discipline !== undefined ||
    profile?.yearsExperience !== undefined;

  const breakdown: Record<string, number> = {};

  if (isEngineer) {
    breakdown.experienceCv = Math.min(
      20,
      years > 0 ? 8 + Math.min(12, years * 1.5) : 0,
    );
    if (!years) tips.push("Add years of experience");

    breakdown.portfolio = Math.min(
      20,
      portfolioCount > 0 ? 8 + Math.min(12, portfolioCount * 3) : 0,
    );
    if (!portfolioCount) tips.push("Add technical portfolio or past projects");

    breakdown.certificates = Math.min(
      15,
      documentsCount > 0 ? 5 + Math.min(10, documentsCount * 2) : 0,
    );
    if (!documentsCount)
      tips.push("Upload completion certificates or recommendations");

    breakdown.scopeSuitability = Math.min(
      15,
      (profile?.website ? 3 : 0) +
        (years >= 3 ? 6 : years > 0 ? 3 : 0) +
        (portfolioCount > 1 ? 6 : portfolioCount > 0 ? 3 : 0),
    );
    breakdown.specialization =
      profile?.specialization && profile?.discipline
        ? 10
        : profile?.specialization || profile?.discipline
          ? 5
          : 0;
    if (!profile?.specialization || !profile?.discipline)
      tips.push("Clarify specialization and discipline");

    breakdown.references = Math.min(
      8,
      reviews > 0 ? 3 + Math.min(5, reviews) : 0,
    );
    breakdown.accreditation = Math.min(
      5,
      profile?.verificationStatus === "VERIFIED"
        ? 5
        : documentsCount > 0
          ? 2
          : 0,
    );
    breakdown.completeness =
      [
        profile?.fullName || profile?.companyName,
        profile?.fullNameAr || profile?.companyNameAr,
        profile?.phone,
        profile?.city,
        profile?.bio || profile?.description,
        profile?.website,
        profile?.education,
        profile?.certifications,
      ].filter(Boolean).length >= 6
        ? 7
        : [
              profile?.phone,
              profile?.city,
              profile?.bio || profile?.description,
            ].filter(Boolean).length >= 3
          ? 4
          : 0;
  } else {
    breakdown.portfolio = Math.min(
      25,
      portfolioCount > 0 ? 10 + Math.min(15, portfolioCount * 3) : 0,
    );
    if (!portfolioCount) tips.push("Add past projects and project photos");

    breakdown.completionDocs = Math.min(
      15,
      documentsCount > 0 ? 5 + Math.min(10, documentsCount * 2) : 0,
    );
    if (!documentsCount) tips.push("Upload handover/completion certificates");

    breakdown.scaleSuitability = Math.min(
      15,
      (years >= 3 ? 5 : years > 0 ? 2 : 0) +
        (profile?.teamSize ? Math.min(5, Math.ceil(profile.teamSize / 5)) : 0) +
        (portfolioCount > 1 ? 5 : portfolioCount > 0 ? 2 : 0),
    );
    breakdown.references = Math.min(
      10,
      reviews > 0 ? 4 + Math.min(6, reviews) : 0,
    );
    breakdown.team = Math.min(
      10,
      (profile?.teamSize ? Math.min(6, Math.ceil(profile.teamSize / 4)) : 0) +
        ((profile?.categories?.length || 0) > 0 ? 4 : 0),
    );
    breakdown.maturity = Math.min(5, years > 0 ? Math.min(5, years) : 0);
    breakdown.accreditation = Math.min(
      10,
      profile?.verificationStatus === "VERIFIED"
        ? 6 + Math.min(4, Math.floor(documentsCount / 2))
        : Math.min(4, documentsCount),
    );
    breakdown.completeness =
      [
        profile?.companyName || profile?.fullName,
        profile?.companyNameAr || profile?.fullNameAr,
        profile?.phone,
        profile?.city,
        profile?.description || profile?.bio,
        profile?.website,
        years > 0,
        profile?.teamSize,
      ].filter(Boolean).length >= 6
        ? 10
        : [
              profile?.phone,
              profile?.city,
              profile?.description || profile?.bio,
            ].filter(Boolean).length >= 3
          ? 6
          : 0;
  }

  let score = Math.round(
    Object.values(breakdown).reduce((sum, value) => sum + value, 0),
  );

  if (profile?.verificationStatus === "VERIFIED") badges.push("VERIFIED");
  else tips.push("Complete verification to improve trust");
  if (years >= 5) badges.push("EXPERIENCED");
  if (rating >= 4.5 && reviews >= 2) badges.push("HIGHLY_RATED");
  if (reviews >= 5) badges.push("TRUSTED");
  if (!profile?.website) tips.push("Add your website");
  if (!profile?.phone) tips.push("Add phone number");
  if (!profile?.city) tips.push("Select your city");
  if (!(profile?.description || profile?.bio))
    tips.push("Add a bio/description");

  score = Math.min(100, score);
  const confidence: "low" | "medium" | "high" =
    profile?.verificationStatus === "VERIFIED" &&
    documentsCount >= 3 &&
    portfolioCount >= 1
      ? "high"
      : documentsCount >= 2 || portfolioCount >= 1
        ? "medium"
        : "low";

  return { score, badges, tips, confidence, breakdown };
}

export interface ProjectSuggestion {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  scopeSummary: string;
  scopeSummaryAr: string;
  suggestedCategory: string;
  suggestedTrades: string[];
  estimatedBudgetMin: number;
  estimatedBudgetMax: number;
  estimatedDuration: string;
}

export async function generateProjectSuggestion(
  userInput: string,
  locale: string = "ar",
): Promise<ProjectSuggestion> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a construction project assistant for a Saudi Arabian construction marketplace called Rasi. 
Help users create structured project listings from their free-text descriptions.

Return a JSON object with these fields:
- title: English project title (concise, professional)
- titleAr: Arabic project title
- description: English detailed description (2-3 paragraphs)
- descriptionAr: Arabic detailed description
- scopeSummary: English scope summary (1 paragraph)
- scopeSummaryAr: Arabic scope summary
- suggestedCategory: One of: "general-construction", "renovation", "electrical", "plumbing", "hvac", "painting-finishing", "flooring-tiling", "steel-metal", "concrete", "landscaping", "interior-design", "waterproofing", "demolition", "road-infrastructure", "fire-safety", "elevator", "glass-aluminum", "maintenance"
- suggestedTrades: Array of required trade names in Arabic
- estimatedBudgetMin: Estimated minimum budget in SAR (number)
- estimatedBudgetMax: Estimated maximum budget in SAR (number)  
- estimatedDuration: Estimated duration description in Arabic

All currency in SAR. Be realistic with Saudi Arabia market prices.`,
      },
      {
        role: "user",
        content: userInput,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No AI response received");

  return JSON.parse(content) as ProjectSuggestion;
}

// ============================================================================
// Smart Matching — Recommend projects to contractors
// ============================================================================

export interface MatchScore {
  projectId: string;
  score: number;
  reasons: string[];
  reasonsAr: string[];
}

export async function generateMatchRecommendations(
  contractorProfile: {
    companyName: string;
    description: string;
    categories: string[];
    locations: string[];
    yearsInBusiness: number;
    teamSize: number;
  },
  projects: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    budgetMin: number;
    budgetMax: number;
  }[],
): Promise<MatchScore[]> {
  if (projects.length === 0) return [];

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a construction marketplace matching engine. 
Given a contractor profile and a list of available projects, score each project's match quality (0-100) and explain why.

Return JSON: { "matches": [{ "projectId": "...", "score": 85, "reasons": ["Category match", "Location match"], "reasonsAr": ["تطابق التصنيف", "تطابق الموقع"] }] }

Consider: category alignment, location overlap, budget fit for team size, experience level match.
Sort by score descending. Only include projects with score > 30.`,
      },
      {
        role: "user",
        content: JSON.stringify({ contractor: contractorProfile, projects }),
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return [];

  const parsed = JSON.parse(content);
  return parsed.matches || [];
}

// ============================================================================
// AI Profile Analysis — Suggest improvements
// ============================================================================

export interface ProfileSuggestion {
  completenessScore: number;
  suggestions: string[];
  suggestionsAr: string[];
  strengths: string[];
  strengthsAr: string[];
}

export async function analyzeContractorProfile(profile: {
  companyName: string;
  description: string | null;
  yearsInBusiness: number | null;
  teamSize: number | null;
  categories: string[];
  locations: string[];
  documentsCount: number;
}): Promise<ProfileSuggestion> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a profile optimization advisor for a construction marketplace.
Analyze the contractor profile and provide:
- completenessScore: 0-100 based on how complete and compelling the profile is
- suggestions: Array of improvement suggestions in English
- suggestionsAr: Same suggestions in Arabic
- strengths: Array of profile strengths in English
- strengthsAr: Same strengths in Arabic

Be specific and actionable. Focus on what would make this contractor more attractive to project owners.
Return as JSON object.`,
      },
      {
        role: "user",
        content: JSON.stringify(profile),
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No AI response received");

  return JSON.parse(content) as ProfileSuggestion;
}

// ============================================================================
// AI Bid Ranking — 100-point weighted algorithm (SS-RK-01)
// Price 30%, Rating 25%, Timeline 20%, Experience 15%, Response 10%
// ============================================================================

export interface BidRankingScore {
  totalScore: number;
  priceScore: number;
  ratingScore: number;
  timelineScore: number;
  experienceScore: number;
  responseScore: number;
}

export function calculateBidScore(
  bid: {
    amount: number;
    estimatedDuration: number | null;
    submittedAt: Date | null;
    contractor: {
      ratingAverage: number;
      reviewCount: number;
      yearsInBusiness: number | null;
      verificationStatus: string;
    };
  },
  project: {
    budgetMin: number | null;
    budgetMax: number | null;
    publishedAt: Date | null;
  },
): BidRankingScore {
  // Price Score (30%) — lower is better, within budget range
  let priceScore = 50;
  if (project.budgetMax && project.budgetMin) {
    const budgetMid = (project.budgetMin + project.budgetMax) / 2;
    const deviation = Math.abs(bid.amount - budgetMid) / budgetMid;
    priceScore = Math.max(0, Math.min(100, 100 - deviation * 100));
    if (bid.amount <= project.budgetMax && bid.amount >= project.budgetMin) {
      priceScore = Math.max(priceScore, 70);
    }
  }

  // Rating Score (25%) — based on contractor's average rating
  const ratingScore = Math.min(100, (bid.contractor.ratingAverage / 5) * 100);

  // Timeline Score (20%) — shorter duration is better (capped)
  let timelineScore = 50;
  if (bid.estimatedDuration) {
    timelineScore = Math.max(
      0,
      Math.min(100, 100 - (bid.estimatedDuration / 365) * 100),
    );
  }

  // Experience Score (15%) — years in business + verification
  let experienceScore = 0;
  const years = bid.contractor.yearsInBusiness || 0;
  experienceScore = Math.min(80, years * 8);
  if (bid.contractor.verificationStatus === "VERIFIED") experienceScore += 20;
  experienceScore = Math.min(100, experienceScore);

  // Response Speed (10%) — how quickly they bid after project published
  let responseScore = 50;
  if (bid.submittedAt && project.publishedAt) {
    const hoursToRespond =
      (new Date(bid.submittedAt).getTime() -
        new Date(project.publishedAt).getTime()) /
      (1000 * 60 * 60);
    responseScore = Math.max(
      0,
      Math.min(100, 100 - (hoursToRespond / 72) * 100),
    );
  }

  // Weighted total
  const totalScore = Math.round(
    priceScore * 0.3 +
      ratingScore * 0.25 +
      timelineScore * 0.2 +
      experienceScore * 0.15 +
      responseScore * 0.1,
  );

  return {
    totalScore,
    priceScore: Math.round(priceScore),
    ratingScore: Math.round(ratingScore),
    timelineScore: Math.round(timelineScore),
    experienceScore: Math.round(experienceScore),
    responseScore: Math.round(responseScore),
  };
}

// ============================================================================
// AI Listing Summary — Generate bilingual descriptions
// ============================================================================

export async function generateBilingualSummary(
  text: string,
  type: "project" | "bid" | "profile" = "project",
): Promise<{ english: string; arabic: string }> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Generate a professional bilingual summary for a construction ${type}. 
Return JSON: { "english": "...", "arabic": "..." }
Keep it concise (2-3 sentences), professional, and relevant to the Saudi construction market.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No AI response received");

  return JSON.parse(content);
}
