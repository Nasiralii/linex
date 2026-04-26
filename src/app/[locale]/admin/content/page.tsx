import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { MANAGED_CONTENT_PAGES, type ManagedContentPageKey } from "@/lib/content-pages";
import { getManagedContentPages } from "@/lib/content-page-service";
import { FileText, Save } from "lucide-react";
import { isFullAccessAdmin } from "@/lib/admin-config";

export const dynamic = "force-dynamic";

async function safeGetCurrentAdmin() {
  for (let i = 0; i < 3; i++) {
    try {
      const user = await getCurrentUser();
      if (user) return user;
    } catch {
      // retry for transient auth/db hiccups
    }

    if (i < 2) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return null;
}

async function saveContentPageAction(formData: FormData) {
  "use server";
  const user = await safeGetCurrentAdmin();
  const locale = await getLocale();
  if (!user || user.role !== "ADMIN") return redirect({ href: "/dashboard", locale });

  const key = String(formData.get("key") || "") as ManagedContentPageKey;
  const fallback = MANAGED_CONTENT_PAGES.find((item) => item.key === key);
  if (!fallback) return;

  const isPublished = formData.get("isPublished") === "on";

  await db.contentPage.upsert({
    where: { key },
    update: {
      title: String(formData.get("title") || fallback.title),
      titleAr: String(formData.get("titleAr") || fallback.titleAr),
      excerpt: String(formData.get("excerpt") || "") || null,
      excerptAr: String(formData.get("excerptAr") || "") || null,
      content: String(formData.get("content") || fallback.content),
      contentAr: String(formData.get("contentAr") || fallback.contentAr),
      seoTitle: String(formData.get("seoTitle") || "") || null,
      seoTitleAr: String(formData.get("seoTitleAr") || "") || null,
      seoDescription: String(formData.get("seoDescription") || "") || null,
      seoDescriptionAr: String(formData.get("seoDescriptionAr") || "") || null,
      isPublished,
      updatedBy: user.id,
    },
    create: {
      key,
      slug: fallback.slug,
      title: String(formData.get("title") || fallback.title),
      titleAr: String(formData.get("titleAr") || fallback.titleAr),
      excerpt: String(formData.get("excerpt") || "") || null,
      excerptAr: String(formData.get("excerptAr") || "") || null,
      content: String(formData.get("content") || fallback.content),
      contentAr: String(formData.get("contentAr") || fallback.contentAr),
      seoTitle: String(formData.get("seoTitle") || "") || null,
      seoTitleAr: String(formData.get("seoTitleAr") || "") || null,
      seoDescription: String(formData.get("seoDescription") || "") || null,
      seoDescriptionAr: String(formData.get("seoDescriptionAr") || "") || null,
      isPublished,
      updatedBy: user.id,
    },
  });

  revalidatePath(`/${locale}/admin/content`);
  if (fallback.slug) revalidatePath(`/${locale}/${fallback.slug}`);
  if (fallback.key === "homepage") revalidatePath(`/${locale}`);

  return redirect({
    href: `/admin/content?page=${key}&saved=1&published=${isPublished ? "1" : "0"}`,
    locale,
  });
}

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ page?: string; saved?: string; published?: string }> }) {
  const user = await safeGetCurrentAdmin();
  const locale = await getLocale();
  if (!user || user.role !== "ADMIN") return redirect({ href: "/dashboard", locale });
  if (!isFullAccessAdmin(user.email)) return redirect({ href: "/admin/users", locale });
  const isRtl = locale === "ar";
  const params = await searchParams;
  const showSavedBanner = params.saved === "1";
  const wasPublished = params.published === "1";
  const pages = await getManagedContentPages();
  const activeKey = (params.page as ManagedContentPageKey) || "homepage";
  const activePage = pages.find((page) => page.key === activeKey) || pages[0];

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "2rem 0" }}>
        <div className="container-app">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText style={{ width: 22, height: 22 }} />
            {isRtl ? "إدارة صفحات المحتوى" : "Content Pages CMS"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.65)", marginTop: "0.35rem" }}>
            {isRtl ? "إدارة صفحات الموقع التعريفية التي تظهر في الفوتر والصفحات العامة." : "Manage the public informational pages linked from the footer and landing pages."}
          </p>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        {showSavedBanner && (
          <div
            className="card"
            style={{
              padding: "1rem 1.25rem",
              marginBottom: "1rem",
              border: `1px solid ${wasPublished ? "var(--success)" : "var(--accent)"}`,
              background: wasPublished ? "rgba(16, 185, 129, 0.08)" : "rgba(184, 115, 51, 0.08)",
              color: wasPublished ? "var(--success)" : "var(--accent)",
              fontSize: "0.875rem",
              fontWeight: 700,
            }}
          >
            {wasPublished
              ? (isRtl ? "✓ تم حفظ الصفحة ونشرها بنجاح" : "✓ Page saved and published successfully")
              : (isRtl ? "✓ تم حفظ الصفحة بنجاح كغير منشورة" : "✓ Page saved successfully as unpublished")}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem" }}>
          <aside className="card" style={{ padding: "1rem", alignSelf: "start" }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              {isRtl ? "الصفحات" : "Pages"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {pages.map((page) => (
                <a
                  key={page.key}
                  href={`/${locale}/admin/content?page=${page.key}`}
                  style={{
                    padding: "0.75rem 0.875rem",
                    borderRadius: "var(--radius-lg)",
                    textDecoration: "none",
                    background: page.key === activePage.key ? "var(--primary-light)" : "var(--surface-2)",
                    color: page.key === activePage.key ? "var(--primary)" : "var(--text-secondary)",
                    border: page.key === activePage.key ? "1px solid var(--primary)" : "1px solid var(--border-light)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {isRtl ? page.titleAr : page.title}
                </a>
              ))}
            </div>
          </aside>

          <div className="card" style={{ padding: "1.5rem" }}>
            <form action={saveContentPageAction} style={{ display: "grid", gap: "1rem" }}>
              <input type="hidden" name="key" value={activePage.key} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label>{isRtl ? "العنوان (إنجليزي)" : "Title (English)"}</label>
                  <input name="title" defaultValue={activePage.title} />
                </div>
                <div>
                  <label>{isRtl ? "العنوان (عربي)" : "Title (Arabic)"}</label>
                  <input name="titleAr" defaultValue={activePage.titleAr} dir="rtl" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label>{isRtl ? "وصف مختصر (إنجليزي)" : "Excerpt (English)"}</label>
                  <textarea name="excerpt" defaultValue={(activePage as any).excerpt || ""} style={{ minHeight: "80px" }} />
                </div>
                <div>
                  <label>{isRtl ? "وصف مختصر (عربي)" : "Excerpt (Arabic)"}</label>
                  <textarea name="excerptAr" defaultValue={(activePage as any).excerptAr || ""} dir="rtl" style={{ minHeight: "80px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label>{isRtl ? "المحتوى (إنجليزي)" : "Content (English)"}</label>
                  <textarea name="content" defaultValue={activePage.content} style={{ minHeight: "260px" }} />
                </div>
                <div>
                  <label>{isRtl ? "المحتوى (عربي)" : "Content (Arabic)"}</label>
                  <textarea name="contentAr" defaultValue={activePage.contentAr} dir="rtl" style={{ minHeight: "260px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label>{isRtl ? "SEO Title (إنجليزي)" : "SEO Title (English)"}</label>
                  <input name="seoTitle" defaultValue={(activePage as any).seoTitle || ""} />
                </div>
                <div>
                  <label>{isRtl ? "SEO Title (عربي)" : "SEO Title (Arabic)"}</label>
                  <input name="seoTitleAr" defaultValue={(activePage as any).seoTitleAr || ""} dir="rtl" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label>{isRtl ? "SEO Description (إنجليزي)" : "SEO Description (English)"}</label>
                  <textarea name="seoDescription" defaultValue={(activePage as any).seoDescription || ""} style={{ minHeight: "100px" }} />
                </div>
                <div>
                  <label>{isRtl ? "SEO Description (عربي)" : "SEO Description (Arabic)"}</label>
                  <textarea name="seoDescriptionAr" defaultValue={(activePage as any).seoDescriptionAr || ""} dir="rtl" style={{ minHeight: "100px" }} />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 0 }}>
                <input type="checkbox" name="isPublished" defaultChecked={(activePage as any).isPublished ?? true} style={{ width: "auto" }} />
                <span>{isRtl ? "منشور للعامة" : "Published publicly"}</span>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="btn-primary">
                  <Save style={{ width: "16px", height: "16px" }} />
                  {isRtl ? "حفظ الصفحة" : "Save Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
