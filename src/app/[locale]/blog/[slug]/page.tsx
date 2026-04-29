import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowLeft, CalendarDays, Clock3, User } from "lucide-react";
import { BLOG_POSTS, getBlogPostBySlug } from "@/lib/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const isRtl = locale === "ar";
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <div className="bg-(--brand-ivory)">
      <section className="container-narrow py-8 md:py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          {isRtl ? "العودة إلى المدونة" : "Back to Blog"}
        </Link>
      </section>

      <article className="container-narrow pb-16">
        <header className="card !p-6 md:!p-8">
          <span className="chip chip-info">{post.category}</span>
          <h1 className="mt-4 text-3xl md:text-4xl leading-tight">{post.title}</h1>
          <p className="mt-4 text-base md:text-lg">{post.excerpt}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-(--text-muted)">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(post.publishedAt).toLocaleDateString(locale)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {post.readTimeMinutes} {isRtl ? "دقائق قراءة" : "min read"}
            </span>
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author} - {post.role}
            </span>
          </div>
        </header>

        <div className="card mt-4 !p-6 md:!p-8">
          <div className="space-y-5">
            {post.content.map((paragraph) => (
              <p key={paragraph} className="text-[0.98rem] md:text-[1.02rem] leading-8">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
