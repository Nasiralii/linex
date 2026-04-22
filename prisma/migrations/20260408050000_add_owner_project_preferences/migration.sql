ALTER TABLE "owner_profiles"
ADD COLUMN "project_preferences" TEXT;

UPDATE "owner_profiles"
SET "project_preferences" = "bio",
    "bio" = NULL
WHERE "project_preferences" IS NULL
  AND "bio" IS NOT NULL
  AND COALESCE("bio_ar", '') = ''
  AND COALESCE("profile_complete", false) = false
  AND "verification_status" = 'DRAFT';