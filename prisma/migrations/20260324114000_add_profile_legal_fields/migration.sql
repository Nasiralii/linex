-- Backfill missing legal/compliance fields expected by the Prisma schema.
-- These columns are referenced by profile save flows and admin review pages.

ALTER TABLE "owner_profiles"
ADD COLUMN IF NOT EXISTS "legal_name" TEXT,
ADD COLUMN IF NOT EXISTS "legal_name_ar" TEXT,
ADD COLUMN IF NOT EXISTS "company_cr" TEXT;

ALTER TABLE "contractor_profiles"
ADD COLUMN IF NOT EXISTS "legal_name" TEXT,
ADD COLUMN IF NOT EXISTS "legal_name_ar" TEXT,
ADD COLUMN IF NOT EXISTS "company_cr" TEXT;

ALTER TABLE "engineer_profiles"
ADD COLUMN IF NOT EXISTS "legal_name" TEXT,
ADD COLUMN IF NOT EXISTS "legal_name_ar" TEXT,
ADD COLUMN IF NOT EXISTS "company_cr" TEXT;