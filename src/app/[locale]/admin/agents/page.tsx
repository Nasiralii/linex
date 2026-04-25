import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Bot, Power, PowerOff, Sparkles, MessageCircle, FileCheck, BarChart3, Send, FileText, PenTool, Shield, DollarSign, Star, Megaphone, Search } from "lucide-react";
import { isFullAccessAdmin } from "@/lib/admin-config";

// Toggle agent on/off
async function toggleAgent(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return;

  const agentKey = formData.get("agentKey") as string;
  const currentValue = formData.get("currentValue") as string;
  const newValue = currentValue === "true" ? "false" : "true";

  try {
    await db.platformSetting.upsert({
      where: { key: `agent_${agentKey}_enabled` },
      update: { value: newValue },
      create: { key: `agent_${agentKey}_enabled`, value: newValue, type: "boolean", label: `Agent: ${agentKey}`, group: "agents" },
    });

    await db.auditLog.create({
      data: { actorId: user.id, action: `AGENT_${newValue === "true" ? "ENABLED" : "DISABLED"}`, entityType: "agent", entityId: agentKey, metadata: { agent: agentKey, enabled: newValue === "true" } },
    });
  } catch (error) {
    console.error('[toggleAgent] DB query failed:', error);
  }

  revalidatePath("/admin/agents");
}

const AGENTS = [
  { key: "customer_support", icon: MessageCircle, name: "Customer Support Chatbot", nameAr: "مساعد الدعم الفني", desc: "24/7 bilingual chatbot on every page", descAr: "روبوت دعم فني ثنائي اللغة على كل صفحة", color: "#0f6b57" },
  { key: "project_intake", icon: Sparkles, name: "Project Intake Assistant", nameAr: "مساعد إنشاء المشاريع", desc: "Conversational project creation wizard", descAr: "معالج إنشاء مشاريع تفاعلي بالذكاء الاصطناعي", color: "#c58b2a" },
  { key: "bid_evaluator", icon: BarChart3, name: "Smart Bid Evaluator", nameAr: "محلل العروض الذكي", desc: "AI analysis and comparison of bids", descAr: "تحليل ومقارنة العروض بالذكاء الاصطناعي", color: "#2563eb" },
  { key: "admin_intelligence", icon: Shield, name: "Admin Intelligence", nameAr: "ذكاء الإدارة", desc: "Platform health insights and alerts", descAr: "تحليلات وتنبيهات صحة المنصة", color: "#7c3aed" },
  { key: "outreach", icon: Send, name: "Outreach & Engagement", nameAr: "التواصل والمشاركة", desc: "Personalized notifications for matching projects", descAr: "إشعارات مخصصة للمشاريع المطابقة", color: "#0891b2" },
  { key: "contract_drafter", icon: FileText, name: "Contract Drafting Agent", nameAr: "وكيل صياغة العقود", desc: "Auto-generate construction contracts", descAr: "إنشاء عقود البناء تلقائياً", color: "#059669" },
  { key: "bid_writer", icon: PenTool, name: "Bid Writing Assistant", nameAr: "مساعد كتابة العروض", desc: "Help contractors write better proposals", descAr: "مساعدة المقاولين في كتابة عروض أفضل", color: "#d97706" },
  { key: "doc_verifier", icon: FileCheck, name: "Document Verification", nameAr: "التحقق من الوثائق", desc: "AI-assisted document verification", descAr: "التحقق من الوثائق بمساعدة الذكاء الاصطناعي", color: "#dc2626" },
  { key: "price_estimator", icon: DollarSign, name: "Price Estimation", nameAr: "تقدير الأسعار", desc: "Market-rate cost estimation for Saudi Arabia", descAr: "تقدير تكاليف بأسعار السوق السعودي", color: "#16a34a" },
  { key: "review_sentiment", icon: Star, name: "Review Sentiment Analysis", nameAr: "تحليل مشاعر التقييمات", desc: "Detect fake reviews, analyze sentiment", descAr: "كشف التقييمات المزيفة وتحليل المشاعر", color: "#ea580c" },
  { key: "marketing", icon: Megaphone, name: "Platform Marketing Agent", nameAr: "وكيل التسويق", desc: "Social media content for Instagram, Twitter, LinkedIn", descAr: "محتوى لوسائل التواصل: انستغرام، تويتر، لينكدإن", color: "#e11d48" },
];

export default async function AdminAgentsPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user || user.role !== "ADMIN") return redirect({ href: "/auth/login", locale });
  if (!isFullAccessAdmin(user.email)) return redirect({ href: "/admin/users", locale });
  const isRtl = locale === "ar";

  // Get all agent settings
  let settings: any[] = [];
  try {
    settings = await db.platformSetting.findMany({ where: { group: "agents" } });
  } catch (error) {
    console.error('[AdminAgentsPage] DB query failed:', error);
  }
  const agentStates: Record<string, boolean> = {};
  AGENTS.forEach(a => {
    const setting = settings.find((s: any) => s.key === `agent_${a.key}_enabled`);
    agentStates[a.key] = setting ? setting.value === "true" : true; // default: enabled
  });

  const enabledCount = Object.values(agentStates).filter(Boolean).length;

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "2rem 0" }}>
        <div className="container-app">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Bot style={{ width: "28px", height: "28px", color: "var(--accent)" }} />
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>
                {isRtl ? "إدارة وكلاء الذكاء الاصطناعي" : "AI Agents Management"}
              </h1>
              <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>
                {isRtl ? `${enabledCount} من ${AGENTS.length} وكيل نشط` : `${enabledCount} of ${AGENTS.length} agents active`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
          {AGENTS.map((agent) => {
            const isEnabled = agentStates[agent.key];
            return (
              <div key={agent.key} className="card" style={{
                padding: "1.5rem", opacity: isEnabled ? 1 : 0.6,
                border: isEnabled ? `2px solid ${agent.color}20` : "2px solid var(--border-light)",
                transition: "all 200ms ease",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "var(--radius-xl)",
                      background: `${agent.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <agent.icon style={{ width: "22px", height: "22px", color: agent.color }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.125rem" }}>
                        {isRtl ? agent.nameAr : agent.name}
                      </h3>
                      <span style={{
                        fontSize: "0.6875rem", fontWeight: 600,
                        color: isEnabled ? "var(--success)" : "var(--error)",
                        background: isEnabled ? "var(--success-light)" : "var(--error-light)",
                        padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)",
                      }}>
                        {isEnabled ? (isRtl ? "نشط" : "Active") : (isRtl ? "متوقف" : "Disabled")}
                      </span>
                    </div>
                  </div>

                  <form action={toggleAgent}>
                    <input type="hidden" name="agentKey" value={agent.key} />
                    <input type="hidden" name="currentValue" value={String(isEnabled)} />
                    <button type="submit" style={{
                      width: "48px", height: "28px", borderRadius: "14px", border: "none", cursor: "pointer",
                      background: isEnabled ? agent.color : "var(--border)",
                      position: "relative", transition: "all 200ms ease",
                    }}>
                      <div style={{
                        width: "22px", height: "22px", borderRadius: "50%", background: "white",
                        position: "absolute", top: "3px",
                        [isEnabled ? "right" : "left"]: "3px",
                        transition: "all 200ms ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }} />
                    </button>
                  </form>
                </div>

                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {isRtl ? agent.descAr : agent.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
