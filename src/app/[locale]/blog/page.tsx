import { getLocale } from "next-intl/server";
import { BlogPageClient } from "@/components/blog/blog-page-client";
import { BLOG_POSTS } from "@/lib/blog-posts";

export default async function BlogPage() {
  const locale = await getLocale();

  return <BlogPageClient posts={BLOG_POSTS} locale={locale} />;
}
