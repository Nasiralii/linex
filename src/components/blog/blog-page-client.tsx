"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { Search, ArrowRight, CalendarDays, Clock3, Tag, SlidersHorizontal, Grid3X3 } from "lucide-react";
import { BLOG_CATEGORIES, type BlogPost } from "@/lib/blog-types";

interface BlogPageClientProps {
  posts: BlogPost[];
  locale: string;
}

const POSTS_PER_PAGE = 6;

export function BlogPageClient({ posts, locale }: BlogPageClientProps) {
  const isRtl = locale === "ar";
  const categoryLabel = (category: (typeof BLOG_CATEGORIES)[number]) => {
    if (!isRtl) return category;
    const labels: Record<(typeof BLOG_CATEGORIES)[number], string> = {
      All: "الكل",
      Construction: "الإنشاءات",
      Engineering: "الهندسة",
      "Project Management": "إدارة المشاريع",
      Procurement: "المشتريات",
      Compliance: "الامتثال",
    };
    return labels[category] || category;
  };
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
  const categoryCounts = useMemo(
    () =>
      BLOG_CATEGORIES.reduce<Record<string, number>>((acc, category) => {
        acc[category] = category === "All" ? posts.length : posts.filter((post) => post.category === category).length;
        return acc;
      }, {}),
    [posts],
  );

  return (
    <div className="bg-(--brand-ivory)">
      <section className="relative overflow-hidden !p-3 bg-linear-to-br from-(--brand-navy-dark) via-(--brand-navy) to-(--brand-teal-dark)">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-(--brand-copper)/15 blur-3xl" />
        <div className="container-app relative z-10 pt-24 pb-18 md:pt-32 md:pb-24">
          <div className="w-full rounded-3xl border border-white/20 bg-white/10 !p-7 md:!p-10 shadow-2xl backdrop-blur-md">
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

      <section className="container-app !mt-6 !pb-32 md:!pb-36">
        <div className="grid gap-6 lg:grid-cols-[250px_1fr] lg:items-start">
          <aside className="hidden lg:block card lg:sticky lg:top-24 lg:self-start lg:h-fit !p-5 md:!p-6 border border-(--border-light)">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text-muted)">
              {isRtl ? "التصنيفات" : "Categories"}
            </div>
            <div className="grid gap-1">
              {BLOG_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className="cursor-pointer"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.55rem 0.7rem",
                    borderRadius: "10px",
                    border: "1px solid transparent",
                    background: selectedCategory === category ? "var(--primary)" : "transparent",
                    color: selectedCategory === category ? "#fff" : "var(--text)",
                    fontSize: "0.86rem",
                  }}
                >
                  <span>{categoryLabel(category)}</span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      borderRadius: "999px",
                      padding: "0.1rem 0.45rem",
                      background: selectedCategory === category ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)",
                    }}
                  >
                    {categoryCounts[category] || 0}
                  </span>
                </button>
              ))}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: "1rem 0" }} />

            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text-muted)">
              {isRtl ? "الترتيب" : "Sort by"}
            </div>
            <div className="grid gap-1">
              {[
                { value: "newest", label: isRtl ? "الأحدث أولاً" : "Newest first" },
                { value: "oldest", label: isRtl ? "الأقدم أولاً" : "Oldest first" },
                { value: "read-time", label: isRtl ? "مدة القراءة" : "Read time" },
              ].map((option) => (
                <label
                  key={option.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    fontSize: "0.86rem",
                    color: "var(--text)",
                    padding: "0.4rem 0.55rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="sort-blog"
                    value={option.value}
                    checked={sortBy === option.value}
                    onChange={() => {
                      setSortBy(option.value as "newest" | "oldest" | "read-time");
                      setCurrentPage(1);
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </aside>

          <div>
            <details className="lg:hidden card mb-4 border border-(--border-light)">
              <summary
                style={{
                  listStyle: "none",
                  cursor: "pointer",
                  padding: "0.9rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
              >
                {isRtl ? "الفلاتر والترتيب" : "Filters & Sorting"}
              </summary>
              <div style={{ padding: "0 1rem 1rem" }}>
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text-muted)">
                  {isRtl ? "التصنيفات" : "Categories"}
                </div>
                <div className="grid gap-1.5">
                  {BLOG_CATEGORIES.map((category) => (
                    <button
                      key={`mobile-${category}`}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category);
                        setCurrentPage(1);
                      }}
                      className="cursor-pointer"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.55rem 0.7rem",
                        borderRadius: "10px",
                        border: "1px solid var(--border-light)",
                        background: selectedCategory === category ? "var(--primary-light)" : "var(--surface)",
                        color: selectedCategory === category ? "var(--primary)" : "var(--text)",
                        fontSize: "0.86rem",
                      }}
                    >
                      <span>{categoryLabel(category)}</span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          borderRadius: "999px",
                          padding: "0.1rem 0.45rem",
                          background: selectedCategory === category ? "rgba(42,123,136,0.14)" : "rgba(0,0,0,0.08)",
                        }}
                      >
                        {categoryCounts[category] || 0}
                      </span>
                    </button>
                  ))}
                </div>
                <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: "1rem 0" }} />
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text-muted)">
                  {isRtl ? "الترتيب" : "Sort by"}
                </div>
                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value as "newest" | "oldest" | "read-time");
                    setCurrentPage(1);
                  }}
                  className="!h-11 !rounded-xl !border !border-(--border-light) !bg-(--surface) !text-sm"
                >
                  <option value="newest">{isRtl ? "الأحدث أولاً" : "Newest first"}</option>
                  <option value="oldest">{isRtl ? "الأقدم أولاً" : "Oldest first"}</option>
                  <option value="read-time">{isRtl ? "مدة القراءة" : "Read time"}</option>
                </select>
              </div>
            </details>

            <div className="!mb-4 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-muted)" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={isRtl ? "ابحث في المقالات..." : "Search articles..."}
                  className="!h-12 !rounded-xl !border !border-(--border-light) !bg-(--surface) !pl-11 !text-sm placeholder:!text-(--text-muted)"
                />
              </div>
              <div className="text-sm text-(--text-muted)">
                {filteredPosts.length} {isRtl ? "مقال" : "articles"}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setSortBy("newest");
                  setCurrentPage(1);
                }}
                className="btn-secondary !h-12 !px-4 !text-xs !rounded-xl whitespace-nowrap"
              >
                {isRtl ? "مسح الفلاتر" : "Clear Filters"}
              </button>
            </div>

            {(selectedCategory !== "All" || search.trim()) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedCategory !== "All" ? (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All")}
                    className="cursor-pointer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "999px",
                      fontSize: "0.74rem",
                      background: "var(--primary-light)",
                      color: "var(--primary)",
                    }}
                  >
                    {categoryLabel(selectedCategory)} x
                  </button>
                ) : null}
                {search.trim() ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="cursor-pointer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "999px",
                      fontSize: "0.74rem",
                      background: "var(--primary-light)",
                      color: "var(--primary)",
                    }}
                  >
                    "{search.trim()}" x
                  </button>
                ) : null}
              </div>
            )}

            <div className="grid !gap-5 md:grid-cols-2">
          {currentPosts.map((post) => (
            <article
              key={post.slug}
              className="card !p-0 !m-0 overflow-hidden rounded-3xl shadow-sm hover:shadow-lg"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
            >
              <div
                style={{
                  marginBottom: "0",
                  borderRadius: "0",
                  overflow: "hidden",
                  background: "#e7ecea",
                }}
              >
                <img
                  src={post.coverImage || "/globe.svg"}
                  alt={post.title}
                  style={{
                    width: "100%",
                    minWidth:"100%",
                    height: "240px",
                    objectFit: "fill",
                    objectPosition: "center",
                    display: "block",
                    padding: "0.7rem",
                  }}
                />
              </div>
              <div className="!p-4">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: "999px",
                      padding: "0.2rem 0.75rem",
                      background: "#e7ecea",
                      color: "var(--brand-teal)",
                      fontSize: "0.82rem",
                      fontWeight: 500,
                    }}
                  >
                    {post.category}
                  </span>
                </div>
              <h3
                className="!mt-4 !mb-0 text-2xl leading-tight"
                style={{
                  color: "var(--text)",
                  fontWeight: 700,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {post.title}
              </h3>
              <p
                className="!mt-3 !mb-0 min-h-[76px] text-[0.95rem] leading-6"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "var(--text-secondary)",
                }}
              >
                {post.excerpt}
              </p>
              {post.tags.length > 0 ? (
                <div className="!mt-5 flex items-center gap-2 text-xs text-(--text-muted)">
                  <Tag className="h-3.5 w-3.5" />
                  {post.tags.join(" • ")}
                </div>
              ) : null}
              </div>
              <div className="!m-0 !px-6 md:!px-7 !py-4 flex items-center justify-between border-t border-(--border-light)">
                <span className="text-sm text-(--text-muted)">
                  {new Date(post.publishedAt).toLocaleDateString(locale)} • {post.readTimeMinutes} {isRtl ? "دقائق" : "min read"}
                </span>
                <Link href={`/blog/${post.slug}`} className="!text-base !font-semibold !text-(--brand-teal) hover:!text-(--brand-teal-dark)">
                  {isRtl ? "المزيد" : "Read More"}
                  <ArrowRight className="h-4 w-4 inline-block !ml-1" />
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
          </div>
        </div>
      </section>
    </div>
  );
}
