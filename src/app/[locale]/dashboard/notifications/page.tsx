"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Bell, Check, CheckCheck, Inbox, ExternalLink } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface Notification {
  id: string;
  type: string;
  title: string;
  titleAr: string | null;
  message: string;
  messageAr: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      }
    } catch {}
    setLoading(false);
  }, []);

    // BUG-15/C08: Poll for new notifications every 5 seconds
    useEffect(() => {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST", credentials: "same-origin" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const resolveNotificationHref = (n: Notification) => {
    if (!n.link) return null;
    const isProjectExpiredNotice =
      n.title === "Your project has expired" ||
      n.titleAr === "انتهت صلاحية مشروعك";
    if (!isProjectExpiredNotice) return n.link;

    const [path, query = ""] = n.link.split("?");
    if (!path.startsWith("/dashboard/projects")) return n.link;

    const params = new URLSearchParams(query);
    if (!params.get("status")) params.set("status", "EXPIRED");
    const q = params.toString();
    return q ? `${path}?${q}` : path;
  };

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)" }}>{isRtl ? "جاري التحميل..." : "Loading..."}</div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1C5963, #2A7B88)", padding: "2rem 0" }}>
        <div className="container-app" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>
              {isRtl ? "الإشعارات" : "Notifications"}
            </h1>
            {unreadCount > 0 && <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>{unreadCount} {isRtl ? "غير مقروء" : "unread"}</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.15)",
              color: "white", border: "none", cursor: "pointer", fontSize: "0.8125rem",
              fontWeight: 600, fontFamily: "inherit",
            }}>
              <CheckCheck style={{ width: "16px", height: "16px" }} />
              {isRtl ? "تحديد الكل كمقروء" : "Mark all read"}
            </button>
          )}
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem", maxWidth: "700px" }}>
        {notifications.length === 0 ? (
          <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
            <Inbox style={{ width: "48px", height: "48px", color: "var(--text-muted)", margin: "0 auto 1rem" }} />
            <p style={{ color: "var(--text-muted)" }}>{isRtl ? "لا توجد إشعارات" : "No notifications"}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {notifications.map((n) => {
              const content = (
                <div className="card" style={{
                  padding: "1rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "0.75rem",
                  borderRight: !n.isRead ? "3px solid var(--primary)" : "3px solid transparent",
                  borderLeft: !n.isRead && isRtl ? "3px solid var(--primary)" : "3px solid transparent",
                  opacity: n.isRead ? 0.7 : 1,
                  cursor: n.link ? "pointer" : "default",
                  transition: "background 150ms ease",
                }}>
                  <Bell style={{ width: "18px", height: "18px", color: n.isRead ? "var(--text-muted)" : "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.9375rem", fontWeight: n.isRead ? 400 : 600, color: "var(--text)", marginBottom: "0.25rem" }}>
                      {isRtl ? (n.titleAr || n.title) : n.title}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                      {isRtl ? (n.messageAr || n.message) : n.message}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                        {new Date(n.createdAt).toLocaleString(isRtl ? "ar-SA" : "en-US")}
                      </div>
                      {n.link && <ExternalLink style={{ width: "12px", height: "12px", color: "var(--primary)" }} />}
                    </div>
                  </div>
                </div>
              );
              const href = resolveNotificationHref(n);
              return href ? (
                <Link key={n.id} href={href} style={{ textDecoration: "none", color: "inherit" }}>
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}