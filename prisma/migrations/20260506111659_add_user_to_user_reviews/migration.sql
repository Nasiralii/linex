/*
  Warnings:

  - A unique constraint covering the columns `[project_id,author_user_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - Made the column `legal_name` on table `contractor_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `legal_name` on table `engineer_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `legal_name` on table `owner_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "awards" DROP CONSTRAINT "awards_contractor_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_author_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_subject_id_fkey";

-- DropIndex
DROP INDEX "engineer_documents_engineer_id_idx";

-- DropIndex
DROP INDEX "portfolio_items_contractor_id_idx";

-- DropIndex
DROP INDEX "portfolio_items_engineer_id_idx";

-- AlterTable
ALTER TABLE "content_pages" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "contractor_profiles" ALTER COLUMN "legal_name" SET NOT NULL;

-- AlterTable
ALTER TABLE "engineer_profiles" ALTER COLUMN "legal_name" SET NOT NULL;

-- AlterTable
ALTER TABLE "owner_profiles" ALTER COLUMN "legal_name" SET NOT NULL;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "author_user_id" TEXT,
ADD COLUMN     "subject_user_id" TEXT,
ALTER COLUMN "author_id" DROP NOT NULL,
ALTER COLUMN "subject_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_project_id_author_user_id_key" ON "reviews"("project_id", "author_user_id");

-- AddForeignKey
ALTER TABLE "awards" ADD CONSTRAINT "awards_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "owner_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "contractor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_subject_user_id_fkey" FOREIGN KEY ("subject_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
