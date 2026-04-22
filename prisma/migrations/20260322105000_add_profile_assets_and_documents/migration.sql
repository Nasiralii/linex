-- CreateTable
CREATE TABLE "engineer_documents" (
    "id" TEXT NOT NULL,
    "engineer_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "admin_notes" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engineer_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_items" (
    "id" TEXT NOT NULL,
    "contractor_id" TEXT,
    "engineer_id" TEXT,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "engineer_documents_engineer_id_idx" ON "engineer_documents"("engineer_id");

-- CreateIndex
CREATE INDEX "portfolio_items_contractor_id_idx" ON "portfolio_items"("contractor_id");

-- CreateIndex
CREATE INDEX "portfolio_items_engineer_id_idx" ON "portfolio_items"("engineer_id");

-- AddForeignKey
ALTER TABLE "engineer_documents" ADD CONSTRAINT "engineer_documents_engineer_id_fkey" FOREIGN KEY ("engineer_id") REFERENCES "engineer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_engineer_id_fkey" FOREIGN KEY ("engineer_id") REFERENCES "engineer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;