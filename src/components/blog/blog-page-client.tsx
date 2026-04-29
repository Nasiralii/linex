"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { Search, ArrowRight, CalendarDays, Clock3, Tag, SlidersHorizontal, Grid3X3 } from "lucide-react";
import { BLOG_CATEGORIES, type BlogPost } from "@/lib/blog-posts";

interface BlogPageClientProps {
  posts: BlogPost[];
  locale: string;
}

const POSTS_PER_PAGE = 4;

export function BlogPageClient({ posts, locale }: BlogPageClientProps) {
  const isRtl = locale === "ar";
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<(typeof BLOG_CATEGORIES)[number]>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "read-time">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = posts.filter((post) => {
      const inCategory = selectedCategory === "All" || post.category === selectedCategory;
      if (!normalizedSearch) return inCategory;

      const searchableText = `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase();
      return inCategory && searchableText.includes(normalizedSearch);
    });

    return filtered.sort((a, b) => {
      if (sortBy === "read-time") return a.readTimeMinutes - b.readTimeMinutes;
      if (sortBy === "oldest") return +new Date(a.publishedAt) - +new Date(b.publishedAt);
      return +new Date(b.publishedAt) - +new Date(a.publishedAt);
    });
  }, [posts, search, selectedCategory, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);
  const featuredPost = posts.find((post) => post.featured) ?? posts[0];

  return (
    <div className="bg-(--brand-ivory)">
      <section className="relative overflow-hidden bg-linear-to-br from-(--brand-navy-dark) via-(--brand-navy) to-(--brand-teal-dark)">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-(--brand-copper)/15 blur-3xl" />
        <div className="container-app relative z-10 pt-24 pb-18 md:pt-32 md:pb-24">
          <div className="max-w-4xl rounded-3xl border border-white/20 bg-white/10 !p-7 md:!p-10 shadow-2xl backdrop-blur-md">
            <span className="chip chip-warning mb-5">{isRtl ? "مدونة راسي" : "Rasi Blog"}</span>
            <h1 className="!text-white text-3xl md:text-6xl font-bold leading-tight">
              {isRtl ? "رؤى احترافية في إدارة المشاريع والمقاولات" : "Professional Insights for Construction and Project Delivery"}
            </h1>
            <p className="mt-6 text-base md:text-xl !text-white max-w-3xl leading-8 md:leading-9">
              {isRtl
                ? "مقالات عملية تساعد المالكين والمقاولين والمهندسين على اتخاذ قرارات أفضل قبل التنفيذ."
                : "Actionable articles for owners, contractors, and engineers to improve planning, procurement, and decision quality."}
            </p>
          </div>
        </div>
      </section>

      <section className="container-app !mt-6 relative z-20 pb-14 md:pb-16">
        <div className="card !p-6 md:!p-8 shadow-lg rounded-2xl md:rounded-3xl border border-(--border-light)">
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-(--text-muted)">
            <SlidersHorizontal className="h-3.5 w-3.5 text-(--primary)" />
            {isRtl ? "تصفية وبحث" : "Filter & Search"}
          </div>

          <div className="grid gap-6 !mt-2 md:gap-7 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-muted)" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder={isRtl ? "ابحث في المقالات..." : "Search articles..."}
                className="!h-12 !rounded-2xl !border-[1.5px] !border-(--border-light) !bg-(--surface) !pl-11 !text-sm placeholder:!text-(--text-muted) focus:!border-(--primary)"
              />
            </div>
            <div className="relative !my-2">
              <Grid3X3 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-muted)" />
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as "newest" | "oldest" | "read-time");
                  setCurrentPage(1);
                }}
                className="!h-12 !rounded-2xl !border-[1.5px] !border-(--border-light) !bg-(--surface) !text-sm !pl-11"
              >
                <option value="newest">{isRtl ? "الأحدث أولاً" : "Newest First"}</option>
                <option value="oldest">{isRtl ? "الأقدم أولاً" : "Oldest First"}</option>
                <option value="read-time">{isRtl ? "مدة القراءة" : "By Read Time"}</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setSortBy("newest");
                setCurrentPage(1);
              }}
              className="btn-secondary !px-4 !py-2 !text-xs !rounded-xl"
            >
              {isRtl ? "مسح الفلاتر" : "Clear Filters"}
            </button>
          </div>

          <div className="  rounded-2xl bg-(--surface-2) !p-5 md:!p-6 !mb-3 m-2">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text-muted)">
              {isRtl ? "التصنيفات" : "Categories"}
            </div>
            <div className="flex flex-wrap gap-4 md:gap-4.5 !mb-3 m-2">
            {BLOG_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  padding: "0.6rem 1.2rem",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border-light)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  background: selectedCategory === category ? "var(--primary-light)" : "var(--surface)",
                  color: selectedCategory === category ? "var(--primary)" : "var(--text-secondary)",
                  boxShadow: selectedCategory === category ? "0 6px 16px rgba(42,123,136,0.16)" : "none",
                }}
              >
                {category}
              </button>
            ))}
            </div>
          </div>
        </div>
      </section>

      {featuredPost && (
        <section className="container-app pb-12 md:pb-14">
          <div className="card overflow-hidden shadow-lg rounded-2xl md:rounded-3xl border-l-4 border-l-(--accent)">
            <div className="grid md:grid-cols-[1.1fr_1.4fr]">
              <div className="bg-linear-to-br from-(--brand-teal-light) to-(--brand-ivory) min-h-[240px] md:min-h-full flex items-center justify-center !p-8">
                <img src={featuredPost.coverImage} alt={featuredPost.title} className="h-32 w-32 opacity-75 md:h-36 md:w-36" />
              </div>
              <div className="!p-7 md:!p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--primary)">
                  {isRtl ? "مقال مميز" : "Featured Article"}
                </p>
                <h2 className="mt-3 text-2xl md:text-4xl leading-tight">{featuredPost.title}</h2>
                <p className="mt-4 text-base leading-8">{featuredPost.excerpt}</p>
                <div className="mt-5 flex flex-wrap gap-3 text-xs text-(--text-muted)">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(featuredPost.publishedAt).toLocaleDateString(locale)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {featuredPost.readTimeMinutes} {isRtl ? "دقائق" : "min read"}
                  </span>
                </div>
                <Link href={`/blog/${featuredPost.slug}`} className="btn-primary mt-7 !rounded-xl !px-6 !py-3">
                  {isRtl ? "اقرأ المقال" : "Read Article"} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="container-app pb-24">
        <div className="mb-6 text-sm text-(--text-muted)">
          {filteredPosts.length} {isRtl ? "مقال متاح" : "articles available"}
        </div>
        <div className="grid gap-7 md:gap-8 md:grid-cols-2">
          {currentPosts.map((post) => (
            <article key={post.slug} className="card !p-6 md:!p-7 shadow-sm hover:shadow-lg rounded-2xl">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="chip chip-info">{post.category}</span>
                <span className="text-(--text-muted)">{new Date(post.publishedAt).toLocaleDateString(locale)}</span>
              </div>
              <h3 className="mt-4 text-xl md:text-2xl leading-tight min-h-[64px]">{post.title}</h3>
              <p className="mt-4 min-h-[92px] text-[0.98rem] leading-7">{post.excerpt}</p>
              <div className="mt-5 flex items-center gap-2 text-xs text-(--text-muted)">
                <Tag className="h-3.5 w-3.5" />
                {post.tags.join(" • ")}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs text-(--text-muted)">
                  {post.author} - {post.readTimeMinutes} {isRtl ? "دقائق" : "min"}
                </span>
                <Link href={`/blog/${post.slug}`} className="btn-secondary !px-4 !py-2 !text-xs !rounded-xl">
                  {isRtl ? "المزيد" : "Read More"}
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="card mt-5 !p-10 text-center rounded-2xl">
            <p>{isRtl ? "لا توجد نتائج مطابقة. جرّب كلمات مختلفة." : "No matching results. Try a different search term."}</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2.5">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "999px",
                  border: "1px solid var(--border-light)",
                  background: currentPage === index + 1 ? "var(--primary)" : "var(--surface)",
                  color: currentPage === index + 1 ? "white" : "var(--text-secondary)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
