ALTER TABLE "engineer_profiles"
ADD COLUMN IF NOT EXISTS "service_area" TEXT;

ALTER TABLE "contractor_profiles"
ADD COLUMN IF NOT EXISTS "service_area" TEXT;