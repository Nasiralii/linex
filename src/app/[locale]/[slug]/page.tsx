import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { PUBLIC_CONTENT_PAGES } from "@/lib/content-pages";
import { getContentPageBySlug } from "@/lib/content-page-service";
import { ContentPageView } from "@/components/content/content-page-view";

export const dynamic = "force-dynamic";

export default async function ManagedContentPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const isRtl = locale === "ar";

  if (!PUBLIC_CONTENT_PAGES.find((page) => page.slug === slug)) {
    notFound();
  }

  const page = await getContentPageBySlug(slug);
  if (!page || ("isPublished" in page && !page.isPublished)) notFound();

  return (
    <ContentPageView
      title={isRtl ? page.titleAr : page.title}
      excerpt={isRtl ? (page.excerptAr || page.excerpt) : page.excerpt}
      content={isRtl ? page.contentAr : page.content}
    />
  );
}