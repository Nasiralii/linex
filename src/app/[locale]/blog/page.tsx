import { getLocale } from "next-intl/server";
import { BlogPageClient } from "@/components/blog/blog-page-client";
import { getBlogPosts } from "@/lib/blog-posts";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const locale = await getLocale();
  const posts = await getBlogPosts(locale);

  return <BlogPageClient posts={posts} locale={locale} />;
}
