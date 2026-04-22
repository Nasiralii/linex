CREATE TABLE IF NOT EXISTS "content_pages" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "title_ar" TEXT NOT NULL,
  "excerpt" TEXT,
  "excerpt_ar" TEXT,
  "content" TEXT NOT NULL,
  "content_ar" TEXT NOT NULL,
  "seo_title" TEXT,
  "seo_title_ar" TEXT,
  "seo_description" TEXT,
  "seo_description_ar" TEXT,
  "is_published" BOOLEAN NOT NULL DEFAULT true,
  "updated_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "content_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "content_pages_key_key" ON "content_pages"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "content_pages_slug_key" ON "content_pages"("slug");