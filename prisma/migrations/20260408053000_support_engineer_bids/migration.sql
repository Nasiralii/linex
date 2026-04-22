ALTER TABLE "bids"
ALTER COLUMN "contractor_id" DROP NOT NULL;

ALTER TABLE "bids"
ADD COLUMN "engineer_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "bids_project_id_engineer_id_key" ON "bids"("project_id", "engineer_id");
CREATE INDEX IF NOT EXISTS "bids_engineer_id_idx" ON "bids"("engineer_id");

ALTER TABLE "bids"
ADD CONSTRAINT "bids_engineer_id_fkey"
FOREIGN KEY ("engineer_id") REFERENCES "engineer_profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "awards"
ALTER COLUMN "contractor_id" DROP NOT NULL;

ALTER TABLE "awards"
ADD COLUMN "engineer_id" TEXT;

ALTER TABLE "awards"
ADD CONSTRAINT "awards_engineer_id_fkey"
FOREIGN KEY ("engineer_id") REFERENCES "engineer_profiles"("id")
ON DELETE SET NULL ON UPDATE CASCADE;