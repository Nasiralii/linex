// ============================================================================
// Smart Match Score — Calculate user-project compatibility (0-100%)
// ============================================================================
// Weights:
//   - Category match: 40%
//   - Location match: 30%
//   - Rating/budget tier: 30%
// ============================================================================

export interface UserMatchProfile {
  role: string;
  categoryIds: string[];
  locationIds: string[];
  city?: string | null;
  ratingAverage: number;
  yearsExperience: number;
  verificationStatus?: string | null;
  profileComplete?: boolean;
  documentsCount?: number;
  website?: string | null;
  teamSize?: number | null;
  specialization?: string | null;
}

export interface ProjectForMatch {
  id: string;
  categoryId: string | null;
  locationId: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  projectType: string;
}

export interface MatchResult {
  projectId: string;
  score: number;
  label: string;
  confidence?: "low" | "medium" | "high";
  reasons?: string[];
}

/**
 * Calculate match score between a user profile and a project.
 * Returns 0-100 score with label.
 */
export function calculateMatchScore(
  user: UserMatchProfile,
  project: ProjectForMatch
): MatchResult {
  const reasons: string[] = [];
  const verified = user.verificationStatus === "VERIFIED";
  const complete = user.profileComplete !== false;

  let categoryScore = user.categoryIds.length === 0 ? 50 : 35;
  let locationScore = user.locationIds.length === 0 ? 50 : 35;
  let capabilityScore = 35;
  let trustScore = 25;

  if (verified) {
    trustScore += 35;
    reasons.push("Verified profile");
  } else {
    trustScore = Math.min(trustScore, 30);
    reasons.push("Profile not fully verified");
  }

  if (project.categoryId && user.categoryIds.length > 0) {
    if (user.categoryIds.includes(project.categoryId)) {
      categoryScore = 100;
      reasons.push("Relevant category match");
    } else {
      categoryScore = 20;
    }
  } else if (user.categoryIds.length === 0) {
    reasons.push("Category match using neutral fallback");
  }

  if (project.locationId && user.locationIds.length > 0) {
    if (user.locationIds.includes(project.locationId)) {
      locationScore = 100;
      reasons.push("Location coverage match");
    } else {
      locationScore = 20;
    }
  } else if (user.locationIds.length === 0) {
    reasons.push("Location match using neutral fallback");
  }

  const budgetMid = ((project.budgetMin || 0) + (project.budgetMax || 0)) / 2;
  const budgetTier = budgetMid > 2_000_000 ? 3 : budgetMid > 500_000 ? 2 : 1;
  const experienceTier = user.yearsExperience >= 8 ? 3 : user.yearsExperience >= 3 ? 2 : 1;
  const ratingTier = user.ratingAverage >= 4.5 ? 3 : user.ratingAverage >= 3.5 ? 2 : 1;
  const profileTier = Math.max(experienceTier, ratingTier);
  capabilityScore = profileTier === budgetTier ? 85 : Math.abs(profileTier - budgetTier) === 1 ? 60 : 35;
  capabilityScore += Math.min(15, user.yearsExperience * 2);
  capabilityScore = Math.min(100, capabilityScore);
  if (capabilityScore >= 75) reasons.push("Project size is suitable for profile strength");

  if ((user.documentsCount || 0) >= 3) trustScore += 10;
  if (user.website) trustScore += 5;
  if (user.teamSize && user.teamSize > 0) trustScore += 5;
  if (!complete) trustScore = Math.max(20, trustScore - 20);

  const score = Math.round(
    categoryScore * 0.35 +
    locationScore * 0.20 +
    capabilityScore * 0.30 +
    trustScore * 0.15
  );

  const label = score >= 80 ? "excellent" :
    score >= 60 ? "good" :
    score >= 40 ? "fair" : "low";

  const confidence: "low" | "medium" | "high" =
    verified && (user.documentsCount || 0) >= 3 && user.categoryIds.length > 0 ? "high" :
    verified || (user.documentsCount || 0) >= 2 ? "medium" : "low";

  return { projectId: project.id, score, label, confidence, reasons };
}
