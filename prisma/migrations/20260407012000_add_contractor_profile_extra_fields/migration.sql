ALTER TABLE "contractor_profiles"
ADD COLUMN IF NOT EXISTS "discipline" TEXT,
ADD COLUMN IF NOT EXISTS "education" TEXT,
ADD COLUMN IF NOT EXISTS "certifications" TEXT;