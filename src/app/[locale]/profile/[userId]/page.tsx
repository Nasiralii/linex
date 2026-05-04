import { getCurrentUser } from "@/lib/auth";
import { redirect, Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { User, Building2, Phone, MapPin, Star, Award, Shield, ArrowLeft, Briefcase, Mail } from "lucide-react";
import { getUserBadges } from "@/lib/badges";
import { BadgeDisplay } from "@/components/badge-display";
import Image from "next/image";

function formatDocumentLabel(documentType: string, isRtl: boolean) {
  const labels: Record<string, { ar: string; en: string }> = {
    commercial_reg: { ar: "السجل التجاري", en: "Commercial Registration" },
    company_profile: { ar: "ملف تعريف الشركة", en: "Company Profile" },
    trade_license: { ar: "الرخصة التجارية", en: "Business License" },
    insurance: { ar: "شهادة التأمين", en: "Insurance Certificate" },
    tax_file: { ar: "الملف الضريبي", en: "Tax File" },
    bank_doc: { ar: "الوثيقة البنكية", en: "Bank Document" },
    eng_license: { ar: "الرخصة الهندسية", en: "Engineering License" },
    education: { ar: "المؤهلات التعليمية", en: "Educational Credentials" },
    prof_insurance: { ar: "التأمين المهني", en: "Professional Insurance" },
    certifications: { ar: "الشهادات", en: "Certifications" },
    gov_id: { ar: "الهوية الحكومية", en: "Government ID" },
  };
  const label = labels[documentType];
  return label ? (isRtl ? label.ar : label.en) : documentType.replace(/_/g, " ");
}

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const currentUser = await getCurrentUser();
  const locale = await getLocale();
  if (!currentUser) return redirect({ href: "/auth/login", locale });
  const isRtl = locale === "ar";

  let profileUser: any = null;
  let userBadges: any[] = [];
  try {
    profileUser = await db.user.findUnique({
      where: { id: userId },
      include: {
        ownerProfile: true,
        contractorProfile: { include: { documents: true, portfolioItems: true } },
        engineerProfile: { include: { documents: true, portfolioItems: true } },
      },
    });

    if (profileUser) {
      userBadges = await getUserBadges(userId);
    }
  } catch (error) {
    console.error('[PublicProfilePage] DB query failed:', error);
  }

  if (!profileUser) return notFound();
  const role = profileUser.role;
  const profile = profileUser.ownerProfile || profileUser.contractorProfile || profileUser.engineerProfile;
  const name = (profile as any)?.companyName || (profile as any)?.fullName || profileUser.email;
  const nameAr = (profile as any)?.companyNameAr || (profile as any)?.fullNameAr || "";
  const phone = (profile as any)?.phone || "";
  const city = (profile as any)?.city || "";
  const bio = (profile as any)?.description || (profile as any)?.bio || "";
  const projectPreferences = (profile as any)?.projectPreferences || "";
  const years = (profile as any)?.yearsInBusiness || (profile as any)?.yearsExperience || 0;
  const rating = (profile as any)?.ratingAverage || 0;
  const reviews = (profile as any)?.reviewCount || 0;
  const verified = (profile as any)?.verificationStatus === "VERIFIED";
  const spec = (profile as any)?.specialization || "";
  const teamSize = (profile as any)?.teamSize || 0;
  const website = (profile as any)?.website || "";
  const companyCr = (profile as any)?.companyCr || "";
  const discipline = (profile as any)?.discipline || "";
  const education = (profile as any)?.education || "";
  const certifications = (profile as any)?.certifications || "";
  const documents = (profile as any)?.documents || [];
  const portfolioItems = (profile as any)?.portfolioItems || [];

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1C5963, #2A7B88)", padding: "2rem 0" }}>
        <div className="container-app">
          <Link href="/marketplace" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", textDecoration: "none" }}>
            <ArrowLeft style={{ width: "14px", height: "14px", display: "inline" }} /> {isRtl ? "رجوع" : "Back"}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "1rem" }}>
            {profileUser.avatarUrl ? (
              <Image
                src={profileUser.avatarUrl}
                alt={isRtl ? "صورة الملف الشخصي" : "Profile Picture"}
                width={80}
                height={80}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid rgba(255,255,255,0.3)"
                }}
              />
            ) : (
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(255,255,255,0.3)" }}>
                <User style={{ width: "36px", height: "36px", color: "rgba(255,255,255,0.7)" }} />
              </div>
            )}
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>{isRtl ? (nameAr || name) : name}</h1>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                <span style={{ padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.15)", color: "white", fontSize: "0.75rem" }}>
                  {role === "OWNER" ? (isRtl ? "مالك مشروع" : "Project Owner") : role === "CONTRACTOR" ? (isRtl ? "مقاول" : "Contractor") : (isRtl ? "مهندس" : "Engineer")}
                </span>
                {verified && <span style={{ padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,0.2)", color: "#10b981", fontSize: "0.75rem" }}>✓ {isRtl ? "موثّق" : "Verified"}</span>}
                {spec && <span style={{ padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", fontSize: "0.75rem" }}>{spec}</span>}
              </div>
              {userBadges.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                  <BadgeDisplay badges={userBadges} locale={locale} size="md" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem", maxWidth: "800px" }}>
        {/* Stats */}
        <div className={`grid ${role === "OWNER" ? "md:grid-cols-2" : "md:grid-cols-4"} grid-cols-2`} style={{ gap: "1rem", marginBottom: "2rem" }}>
          <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "2px", marginBottom: "0.25rem" }}>
              {[1,2,3,4,5].map(s => <Star key={s} style={{ width: "14px", height: "14px", fill: s <= Math.round(rating) ? "var(--accent)" : "none", color: s <= Math.round(rating) ? "var(--accent)" : "var(--border)" }} />)}
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{rating.toFixed(1)} ({reviews} {isRtl ? "تقييم" : "reviews"})</div>
          </div>
          {role !== "OWNER" && (
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>{years}</div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{isRtl ? "سنوات خبرة" : "Years Exp."}</div>
            </div>
          )}
          {role !== "OWNER" && (
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--info)" }}>{teamSize || "—"}</div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{isRtl ? "حجم الفريق" : "Team Size"}</div>
            </div>
          )}
          <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent)" }}>{verified ? "✓" : "⏳"}</div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{isRtl ? "التحقق" : "Verification"}</div>
          </div>
        </div>

        {/* Info */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>{isRtl ? "معلومات الاتصال" : "Contact Info"}</h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}><Phone style={{ width: "16px", height: "16px", color: "var(--primary)" }} /> {phone}</div>}
            {city && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}><MapPin style={{ width: "16px", height: "16px", color: "var(--primary)" }} /> {city}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}><Mail style={{ width: "16px", height: "16px", color: "var(--primary)" }} /> {profileUser.email}</div>
            {website && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}><Building2 style={{ width: "16px", height: "16px", color: "var(--primary)" }} /> <a href={website} target="_blank" style={{ color: "var(--primary)" }}>{website}</a></div>}
            {companyCr && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}><Briefcase style={{ width: "16px", height: "16px", color: "var(--primary)" }} /> {isRtl ? `السجل التجاري: ${companyCr}` : `Commercial Registration: ${companyCr}`}</div>}
          </div>
        </div>

        {(discipline || education || certifications) && (
          <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>{isRtl ? "التفاصيل المهنية" : "Professional Details"}</h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {discipline && <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}><strong>{isRtl ? "التخصص الهندسي:" : "Discipline:"}</strong> {discipline}</div>}
              {education && <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}><strong>{isRtl ? "التعليم:" : "Education:"}</strong> {education}</div>}
              {certifications && <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}><strong>{isRtl ? "الشهادات:" : "Certifications:"}</strong> {certifications}</div>}
            </div>
          </div>
        )}

        {/* Bio */}
        {bio && (
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem" }}>{isRtl ? "نبذة" : "About"}</h3>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>{bio}</p>
          </div>
        )}

        {projectPreferences && (
          <div className="card" style={{ padding: "1.5rem", marginTop: bio ? "1.5rem" : 0 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem" }}>{isRtl ? "تفضيلات المشاريع" : "Project Preferences"}</h3>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>{projectPreferences}</p>
          </div>
        )}

        {documents.length > 0 && (
          <div className="card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem" }}>{isRtl ? "الوثائق" : "Documents"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {documents.map((doc: any) => (
                <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
                  {formatDocumentLabel(doc.documentType, isRtl)}
                </a>
              ))}
            </div>
          </div>
        )}

        {portfolioItems.length > 0 && (
          <div className="card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem" }}>{isRtl ? "معرض الأعمال" : "Portfolio"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
              {portfolioItems.map((item: any, i: number) => (
                <a key={item.id || i} href={item.fileUrl} target="_blank" rel="noreferrer" style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden", aspectRatio: "4/3", background: "var(--surface-2)", textDecoration: "none" }}>
                  <img src={item.fileUrl} alt={item.fileName || `Portfolio ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0.25rem 0.5rem", background: "rgba(0,0,0,0.5)", fontSize: "0.6875rem", color: "white" }}>
                    {(item.fileName || `Portfolio ${i + 1}`).substring(0, 25)}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}