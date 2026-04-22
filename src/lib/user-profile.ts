// Fetch user match profile for smart matching
import { db } from "@/lib/db";
import type { UserMatchProfile } from "@/lib/match-score";

export async function getUserMatchProfile(userId: string, role: string): Promise<UserMatchProfile | null> {
  if (role === "CONTRACTOR") {
    const profile = await db.contractorProfile.findUnique({
      where: { userId },
      include: { categories: true, locations: true },
    });
    if (!profile) return null;
    return {
      role,
      categoryIds: profile.categories.map((c) => c.categoryId),
      locationIds: profile.locations.map((l) => l.locationId),
      city: profile.city,
      ratingAverage: profile.ratingAverage,
      yearsExperience: profile.yearsInBusiness || 0,
      verificationStatus: profile.verificationStatus,
      profileComplete: profile.profileComplete,
      website: profile.website,
      teamSize: profile.teamSize,
      documentsCount: await db.contractorDocument.count({ where: { contractorId: profile.id } }),
    };
  }
  if (role === "ENGINEER") {
    const profile = await db.engineerProfile.findUnique({ where: { userId } });
    if (!profile) return null;
    return {
      role,
      categoryIds: [],
      locationIds: [],
      city: profile.city,
      ratingAverage: profile.ratingAverage,
      yearsExperience: profile.yearsExperience || 0,
      verificationStatus: profile.verificationStatus,
      profileComplete: profile.profileComplete,
      website: profile.website,
      specialization: profile.specialization,
      documentsCount: await db.engineerDocument.count({ where: { engineerId: profile.id } }),
    };
  }
  return null;
}
