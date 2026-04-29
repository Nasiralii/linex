"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { Menu, X, Globe, User, LogOut } from "lucide-react";

async function createClientAuthAuditLog(action: string, metadata?: Record<string, unknown>) {
  try {
    await fetch("/api/auth/me", {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "x-auth-client-event": action,
        "x-auth-client-meta": JSON.stringify(metadata || {}),
      },
    });
  } catch {
    // Never block UI on client auth incident logging failure
  }
}

interface NavbarProps {
  initialUser: { email: string; role: string; notificationCount?: number } | null;
}

export function Navbar({ initialUser }: NavbarProps) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [activeHash, setActiveHash] = useState("");
  const isAuthRoute = pathname.includes("/auth/");

  const user = currentUser;
  const effectiveUser = isAuthRoute ? null : user;

  // Client-side fetch for notification count + verification (avoids layout DB crashes)
  const [notifCount, setNotifCount] = useState(initialUser?.notificationCount || 0);
  const [verificationPending, setVerificationPending] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [authSyncIssue, setAuthSyncIssue] = useState(false);
  useEffect(() => {
    if (isAuthRoute && initialUser) {
      createClientAuthAuditLog("AUTH_PAGE_RENDERED_WITH_SIGNED_IN_NAVBAR", { pathname, email: initialUser.email, role: initialUser.role });
      setCurrentUser(null);
      setNotifCount(0);
      setVerificationPending(false);
      setProfileIncomplete(false);
      setAuthSyncIssue(false);
      return;
    }

    let cancelled = false;

    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(async (r) => {
        if (r.status === 401) return { unauthorized: true } as const;
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;

        if ((data as any)?.unauthorized) {
          createClientAuthAuditLog("AUTH_STATE_MISMATCH_DETECTED", { pathname, reason: "api_auth_me_unauthorized_with_initial_user" });
          if (!initialUser) {
            setCurrentUser(null);
            setNotifCount(0);
            setVerificationPending(false);
            setProfileIncomplete(false);
          }
          setAuthSyncIssue(true);
          return;
        }

        if (data) {
          setCurrentUser({
            email: data.email,
            role: data.role,
            notificationCount: data.notificationCount || 0,
          });
          setNotifCount(data.notificationCount || 0);
          setVerificationPending(data.verificationStatus === "PENDING");
          setProfileIncomplete(data.role !== "ADMIN" && data.profileComplete === false);
          setAuthSyncIssue(false);
        } else {
          createClientAuthAuditLog("AUTH_STATE_MISMATCH_DETECTED", { pathname, reason: "api_auth_me_empty_response" });
          if (!initialUser) {
            setCurrentUser(null);
            setNotifCount(0);
            setVerificationPending(false);
            setProfileIncomplete(false);
          }
          setAuthSyncIssue(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        createClientAuthAuditLog("AUTH_STATE_MISMATCH_DETECTED", { pathname, reason: "api_auth_me_fetch_failed" });
        if (!initialUser) {
          setCurrentUser(null);
          setNotifCount(0);
          setVerificationPending(false);
          setProfileIncomplete(false);
        }
        setAuthSyncIssue(true);
      });

    return () => {
      cancelled = true;
    };
  }, [initialUser, isAuthRoute, pathname]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncHash = () => setActiveHash(window.location.hash || "");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);
  const isRtl = locale === "ar";
  const otherLocale = locale === "ar" ? "en" : "ar";

  const switchLocale = () => router.replace(pathname, { locale: otherLocale });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    router.replace("/");
    router.refresh();
  };

  const appNavLinks = [
    { href: "/" as const, label: t("home") },
    ...(effectiveUser ? [{ href: "/marketplace" as const, label: t("marketplace") }] : []),
    ...(effectiveUser && effectiveUser.role !== "ADMIN" ? [{ href: "/dashboard" as const, label: t("dashboard") }] : []),
    ...(effectiveUser && effectiveUser.role !== "ADMIN" ? [{ href: "/dashboard/profile" as const, label: locale === "ar" ? "الملف الشخصي" : "Profile" }] : []),
    ...(effectiveUser?.role === "OWNER" ? [{ href: "/dashboard/projects" as const, label: isRtl ? "مشاريعي" : "My Projects" }] : []),
    ...(effectiveUser && effectiveUser.role !== "ADMIN" && effectiveUser.role !=="CONTRACTOR" ? [{ href: "/dashboard/supervision" as const, label: isRtl ? "طلبات الإشراف" : "Supervision Requests" }] : []),
    ...(effectiveUser && effectiveUser.role !== "ADMIN" ? [{ href: "/dashboard/wallet" as const, label: isRtl ? "المحفظة" : "Wallet" }] : []),
    ...(effectiveUser?.role === "ADMIN" ? [{ href: "/admin" as const, label: t("dashboard") }] : []),
    ...(effectiveUser?.role === "ADMIN" ? [{ href: "/admin/reports" as const, label: locale === "ar" ? "التقارير" : "Reports" }] : []),
  ];

  const homeBaseHref = locale === "ar" ? "/ar" : "/";
  const marketingNavLinks = [
    { href: homeBaseHref, label: t("home") },
    { href: `${homeBaseHref}#how-it-works`, label: locale === "ar" ? "كيف تعمل" : "How It Works" },
    { href: `${homeBaseHref}#about`, label: locale === "ar" ? "من نحن" : "About" },
    { href: `${homeBaseHref}#owners`, label: locale === "ar" ? "لأصحاب المشاريع" : "For Owners" },
    { href: `${homeBaseHref}#professionals`, label: locale === "ar" ? "للمقاولين والمهندسين" : "For Professionals" },
    { href: `${homeBaseHref}#verification`, label: locale === "ar" ? "التحقق والتأهيل" : "Verification" },
    { href: `${homeBaseHref}#partners`, label: locale === "ar" ? "الشركاء" : "Partners" },
    { href: `${homeBaseHref}#faq-contact-section`, label: locale === "ar" ? "تواصل معنا" : "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50" style={{
      backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-light)",
    }}>
      <div className="container-app">
        <div className="flex items-center justify-between" style={{ height: "64px" }}>
          <Link href="/" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
            <img src="/logo.jpg" alt="Rasi" style={{ width: "40px", height: "40px" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
                {isRtl ? "راسي" : "Rasi"}
              </span>
              <span style={{ fontSize: "0.625rem", color: "var(--text-muted)", lineHeight: 1.2 }}>
                {tCommon("tagline")}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center" style={{ gap: "4px" }}>
            {(effectiveUser ? appNavLinks : marketingNavLinks).map((link) => (
              <Link className="xl:text-sm text-sm 2xl:gap-x-2 gap-x-1" key={link.href} href={link.href} onClick={() => {
                if (!effectiveUser && link.href.includes("#")) {
                  const nextHash = `#${link.href.split("#")[1] || ""}`;
                  setActiveHash(nextHash);
                }
              }} style={{
                padding: "0.5rem", borderRadius: "var(--radius-lg)",
                fontWeight: 500, textDecoration: "none",
                color: (() => {
                  if (!effectiveUser && link.href.includes("#")) {
                    const hash = `#${link.href.split("#")[1] || ""}`;
                    return activeHash === hash ? "var(--primary)" : "var(--text-secondary)";
                  }
                  return pathname === link.href ? "var(--primary)" : "var(--text-secondary)";
                })(),
                background: (() => {
                  if (!effectiveUser && link.href.includes("#")) {
                    const hash = `#${link.href.split("#")[1] || ""}`;
                    return activeHash === hash ? "var(--primary-light)" : "transparent";
                  }
                  return pathname === link.href ? "var(--primary-light)" : "transparent";
                })(),
              }}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center" style={{ gap: "8px" }}>
            <button onClick={switchLocale} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "0.5rem 0.75rem", borderRadius: "var(--radius-lg)",
              fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)",
              background: "transparent", border: "1px solid var(--border-light)",
              cursor: "pointer", fontFamily: "inherit",
            }}>
              <Globe style={{ width: "15px", height: "15px" }} />
              {t("language")}
            </button>

            {effectiveUser ? (
              <>
                {/* Notification badge */}
                <Link href="/dashboard/notifications" style={{
                  position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                  width: "36px", height: "36px", borderRadius: "var(--radius-lg)",
                  background: "var(--surface-2)", border: "1px solid var(--border-light)",
                  textDecoration: "none", color: "var(--text-muted)",
                }}>
                  🔔
                  {notifCount > 0 && (
                    <span style={{
                      position: "absolute", top: "-4px", right: "-4px",
                      width: "18px", height: "18px", borderRadius: "50%",
                      background: "var(--error)", color: "white",
                      fontSize: "0.625rem", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2px solid white",
                    }}>
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </Link>
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.375rem 0.75rem", borderRadius: "var(--radius-lg)",
                  background: "var(--primary-light)", fontSize: "0.8125rem",
                  fontWeight: 600, color: "var(--primary)",
                }}>
                  <User style={{ width: "14px", height: "14px" }} />
                  <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {effectiveUser.email.split("@")[0]}
                  </span>
                </div>
                <button onClick={handleLogout} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "0.5rem 0.75rem", borderRadius: "var(--radius-lg)",
                  fontSize: "0.8125rem", fontWeight: 500, color: "var(--error)",
                  background: "transparent", border: "1px solid var(--border-light)",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  <LogOut style={{ width: "14px", height: "14px" }} />
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{
                  padding: "0.5rem 1.25rem", borderRadius: "var(--radius-lg)",
                  fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)",
                  textDecoration: "none", border: "1px solid var(--border)",
                }}>
                  {t("login")}
                </Link>
                <Link href="/auth/register" className="btn-primary" style={{
                  textDecoration: "none", padding: "0.5rem 1.25rem", fontSize: "0.875rem",
                }}>
                  {t("register")}
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden" style={{
            padding: "0.5rem", borderRadius: "var(--radius-lg)", color: "var(--text)",
            background: "transparent", border: "1px solid var(--border-light)", cursor: "pointer",
          }}>
            {mobileMenuOpen ? <X style={{ width: "22px", height: "22px" }} /> : <Menu style={{ width: "22px", height: "22px" }} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden animate-fade-in" style={{ padding: "1rem 0", borderTop: "1px solid var(--border-light)" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {(effectiveUser ? appNavLinks : marketingNavLinks).map((link) => (
                <Link key={link.href} href={link.href} onClick={() => {
                  if (!effectiveUser && link.href.includes("#")) {
                    const nextHash = `#${link.href.split("#")[1] || ""}`;
                    setActiveHash(nextHash);
                  }
                  setMobileMenuOpen(false);
                }} style={{
                  padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)",
                  fontSize: "0.9375rem", fontWeight: 500, textDecoration: "none",
                  color: (() => {
                    if (!effectiveUser && link.href.includes("#")) {
                      const hash = `#${link.href.split("#")[1] || ""}`;
                      return activeHash === hash ? "var(--primary)" : "var(--text-secondary)";
                    }
                    return pathname === link.href ? "var(--primary)" : "var(--text-secondary)";
                  })(),
                  background: (() => {
                    if (!effectiveUser && link.href.includes("#")) {
                      const hash = `#${link.href.split("#")[1] || ""}`;
                      return activeHash === hash ? "var(--primary-light)" : "transparent";
                    }
                    return pathname === link.href ? "var(--primary-light)" : "transparent";
                  })(),
                }}>
                  {link.label}
                </Link>
              ))}
              <div style={{ borderTop: "1px solid var(--border-light)", margin: "0.5rem 0" }} />
              <button onClick={() => { switchLocale(); setMobileMenuOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "0.75rem 1rem",
                borderRadius: "var(--radius-lg)", fontSize: "0.9375rem", fontWeight: 500,
                color: "var(--text-secondary)", background: "transparent", border: "none",
                cursor: "pointer", fontFamily: "inherit", textAlign: isRtl ? "right" : "left",
              }}>
                <Globe style={{ width: "16px", height: "16px" }} /> {t("language")}
              </button>
              <div style={{ borderTop: "1px solid var(--border-light)", margin: "0.5rem 0" }} />
              <div style={{ display: "flex", gap: "8px", padding: "0.5rem 0" }}>
                {effectiveUser ? (
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="btn-primary" style={{
                    flex: 1, justifyContent: "center", background: "var(--error)", fontSize: "0.875rem",
                  }}>
                    <LogOut style={{ width: "16px", height: "16px" }} /> {t("logout")}
                  </button>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} style={{
                      flex: 1, textAlign: "center", padding: "0.625rem", borderRadius: "var(--radius-lg)",
                      fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)",
                      textDecoration: "none", border: "1.5px solid var(--border)",
                    }}>
                      {t("login")}
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{
                      flex: 1, textAlign: "center", padding: "0.625rem", fontSize: "0.875rem", textDecoration: "none",
                    }}>
                      {t("register")}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      {effectiveUser && effectiveUser.role !== "ADMIN" && (profileIncomplete || verificationPending) && (
        <div style={{
          borderTop: "1px solid var(--border-light)",
          background: profileIncomplete ? "#fff7ed" : "#eff6ff",
          color: profileIncomplete ? "#9a3412" : "#1d4ed8",
        }}>
          <div className="container-app !p-2" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
            padding: "0.75rem 0",
            fontSize: "0.8125rem", fontWeight: 600,
          }}>
            <span>
              {profileIncomplete
                ? (isRtl
                    ? "يرجى إكمال الملف الشخصي ورفع جميع الوثائق المطلوبة قبل إرسال طلب الانضمام للإدارة."
                    : "Please complete your profile and upload all required documents before your application is sent to admin.")
                : (isRtl
                    ? "تم إرسال طلبك إلى الإدارة وهو الآن بانتظار المراجعة."
                    : "Your application has been submitted to admin and is now pending review.")}
            </span>
            <Link href="/dashboard/profile" style={{ color: "inherit", textDecoration: "underline", whiteSpace: "nowrap" }}>
              {isRtl ? "إكمال الملف" : "Complete profile"}
            </Link>
          </div>
        </div>
      )}
      {/* {authSyncIssue && (
        <div style={{ borderTop: "1px solid var(--border-light)", background: "#fff7ed", color: "#9a3412" }}>
          <div className="container-app" style={{ padding: "0.6rem 0", fontSize: "0.8125rem", fontWeight: 600 }}>
            {isRtl
              ? "يوجد تأخير مؤقت في مزامنة حالة تسجيل الدخول. يرجى إعادة المحاولة خلال لحظات."
              : "There is a temporary delay syncing your sign-in state. Please try again in a moment."}
          </div>
        </div>
      )} */}
    </header>
  );
}