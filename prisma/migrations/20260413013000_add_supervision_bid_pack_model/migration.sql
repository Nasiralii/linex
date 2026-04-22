ALTER TABLE "engineer_profiles"
ADD COLUMN "supervision_bid_credits" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "supervision_requests"
ALTER COLUMN "requestFee" SET DEFAULT 150,
ALTER COLUMN "walletDeduction" SET DEFAULT 500;

ALTER TABLE "supervision_requests"
ADD COLUMN "awarded_bid_id" TEXT;

CREATE TABLE "supervision_bids" (
    "id" TEXT NOT NULL,
    "supervision_request_id" TEXT NOT NULL,
    "engineer_id" TEXT NOT NULL,
    "proposed_fee" DOUBLE PRECISION NOT NULL,
    "estimated_duration_days" INTEGER,
    "proposal_text" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "credits_used" INTEGER NOT NULL DEFAULT 1,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awarded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervision_bids_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "supervision_requests_awarded_bid_id_key" ON "supervision_requests"("awarded_bid_id");
CREATE UNIQUE INDEX "supervision_bids_supervision_request_id_engineer_id_key" ON "supervision_bids"("supervision_request_id", "engineer_id");
CREATE INDEX "supervision_bids_engineer_id_idx" ON "supervision_bids"("engineer_id");
CREATE INDEX "supervision_bids_status_idx" ON "supervision_bids"("status");

ALTER TABLE "supervision_bids"
ADD CONSTRAINT "supervision_bids_supervision_request_id_fkey"
FOREIGN KEY ("supervision_request_id") REFERENCES "supervision_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "supervision_bids"
ADD CONSTRAINT "supervision_bids_engineer_id_fkey"
FOREIGN KEY ("engineer_id") REFERENCES "engineer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "supervision_requests"
ADD CONSTRAINT "supervision_requests_project_id_fkey"
FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
