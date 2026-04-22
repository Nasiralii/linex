-- AlterTable
ALTER TABLE "owner_profiles"
ADD COLUMN "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "verified_at" TIMESTAMP(3),
ADD COLUMN "rejection_reason" TEXT;