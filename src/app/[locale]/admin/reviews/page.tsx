import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Star, Eye, EyeOff, Trash2, Shield } from "lucide-react";
import { isFullAccessAdmin } from "@/lib/admin-config";

// G16: Admin rating moderation

async function moderateReviewAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return;
  const reviewId = formData.get("reviewId") as string;
  const action = formData.get("action") as string;

  try {
    if (action === "hide") {
      await db.review.update({ where: { id: reviewId }, data: { isVisible: false, moderationStatus: "hidden" } });
    } else if (action === "show") {
      await db.review.update({ where: { id: reviewId }, data: { isVisible: true, moderationStatus: "approved" } });
    } else if (action === "delete") {
      await db.review.delete({ where: { id: reviewId } });
    }

    await db.auditLog.create({
      data: { actorId: user.id, action: `REVIEW_${action.toUpperCase()}`, entityType: "review", entityId: reviewId },
    });
  } catch (error) {
    console.error('[moderateReviewAction] DB query failed:', error);
  }
  revalidatePath("/admin/reviews");
}

export default async function AdminReviewsPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user || user.role !== "ADMIN") return redirect({ href: "/dashboard", locale });
  if (!isFullAccessAdmin(user.email)) return redirect({ href: "/admin/users", locale });
  const isRtl = locale === "ar";

  let reviews: any[] = [];
  try {
    reviews = await db.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { fullName: true } },
        subject: { select: { companyName: true } },
        project: { select: { title: true } },
      },
      take: 50,
    });
  } catch (error) {
    console.error('[AdminReviewsPage] DB query failed:', error);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "2rem 0" }}>
        <div className="container-app">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Shield style={{ width: "24px", height: "24px" }} />
            {isRtl ? "إدارة التقييمات" : "Review Moderation"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>{reviews.length} {isRtl ? "تقييم" : "reviews"}</p>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        {reviews.length === 0 ? (
          <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)" }}>{isRtl ? "لا توجد تقييمات" : "No reviews yet"}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {reviews.map((r: any) => (
              <div key={r.id} className="card" style={{ padding: "1.25rem", opacity: r.isVisible ? 1 : 0.6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <div style={{ display: "flex", gap: "2px" }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} style={{ width: "14px", height: "14px", fill: s <= r.rating ? "var(--accent)" : "none", color: s <= r.rating ? "var(--accent)" : "var(--border)" }} />
                        ))}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {r.author?.fullName} → {r.subject?.companyName}
                      </span>
                      {!r.isVisible && <span className="chip chip-error" style={{ fontSize: "0.6875rem" }}>{isRtl ? "مخفي" : "Hidden"}</span>}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{r.comment || "—"}</div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      {r.project?.title} • {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    <form action={moderateReviewAction}>
                      <input type="hidden" name="reviewId" value={r.id} />
                      <input type="hidden" name="action" value={r.isVisible ? "hide" : "show"} />
                      <button type="submit" title={r.isVisible ? "Hide" : "Show"} style={{
                        width: "32px", height: "32px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                        background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {r.isVisible ? <EyeOff style={{ width: "14px", height: "14px", color: "var(--text-muted)" }} /> : <Eye style={{ width: "14px", height: "14px", color: "var(--primary)" }} />}
                      </button>
                    </form>
                    <form action={moderateReviewAction}>
                      <input type="hidden" name="reviewId" value={r.id} />
                      <input type="hidden" name="action" value="delete" />
                      <button type="submit" title="Delete" style={{
                        width: "32px", height: "32px", borderRadius: "var(--radius-md)", border: "1px solid var(--error)",
                        background: "var(--error-light)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Trash2 style={{ width: "14px", height: "14px", color: "var(--error)" }} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
