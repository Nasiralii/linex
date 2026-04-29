import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowLeft, CalendarDays, Clock3, User } from "lucide-react";
import { getBlogPostBySlugLive } from "@/lib/blog-posts";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const isRtl = locale === "ar";
  const post = await getBlogPostBySlugLive(slug, locale);
  const isPlaceholderImage = !post?.coverImage || post.coverImage.includes("globe.svg");

  if (!post) notFound();

  return (
    <div className="bg-(--brand-ivory)">
      <section className="container-app pt-8 pb-5 md:pt-12 md:pb-7">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          {isRtl ? "العودة إلى المدونة" : "Back to Blog"}
        </Link>
      </section>

      <article className="container-app pb-18 md:pb-24">
        <header className="card !p-6 md:!p-8 lg:!p-10 shadow-sm">
          <span className="chip chip-info">{post.category}</span>
          <div
            style={{
              marginTop: "0.9rem",
              borderRadius: "14px",
              overflow: "hidden",
              background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
              border: "1px solid var(--border-light)",
              minHeight: "260px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={post.coverImage || "/globe.svg"}
              alt={post.title}
              style={{
                width: "100%",
                maxHeight: "420px",
                objectFit: isPlaceholderImage ? "contain" : "cover",
                display: "block",
                padding: isPlaceholderImage ? "1.25rem" : "0",
              }}
            />
          </div>
          <h1 className="mt-6 text-3xl md:text-4xl lg:text-5xl leading-tight">{post.title}</h1>
          <p className="mt-5 text-base md:text-lg leading-8 text-(--text-secondary)">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-(--text-muted)">
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

      </article>
    </div>
  );
}
