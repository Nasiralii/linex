import { db } from "@/lib/db";
import {
  MANAGED_CONTENT_PAGES,
  MANAGED_CONTENT_PAGE_MAP,
  type ManagedContentPageDefinition,
  type ManagedContentPageKey,
} from "@/lib/content-pages";

export type ContentPageRecord = {
  key: string;
  slug: string;
  title: string;
  titleAr: string;
  excerpt: string | null;
  excerptAr: string | null;
  content: string;
  contentAr: string;
  seoTitle: string | null;
  seoTitleAr: string | null;
  seoDescription: string | null;
  seoDescriptionAr: string | null;
  isPublished: boolean;
  updatedAt: Date;
};

export function getContentPageFallback(key: ManagedContentPageKey): ManagedContentPageDefinition {
  return MANAGED_CONTENT_PAGE_MAP.get(key)!;
}

export async function getManagedContentPages() {
  try {
    const pages = await db.contentPage.findMany({ orderBy: { key: "asc" } });
    return MANAGED_CONTENT_PAGES.map((fallback) => pages.find((page) => page.key === fallback.key) || fallback);
  } catch {
    return MANAGED_CONTENT_PAGES;
  }
}

export async function getContentPageByKey(key: ManagedContentPageKey) {
  try {
    const page = await db.contentPage.findUnique({ where: { key } });
    return page || getContentPageFallback(key);
  } catch {
    return getContentPageFallback(key);
  }
}

export async function getContentPageBySlug(slug: string) {
  try {
    const page = await db.contentPage.findUnique({ where: { slug } });
    if (page) return page;
  } catch {
    // fallback below
  }
  return MANAGED_CONTENT_PAGES.find((item) => item.slug === slug) || null;
}
