import { getCurrentUser } from "@/lib/auth";
import { redirect, Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { FileText, ArrowLeft, PenTool, CheckCircle, Banknote, Shield, Download } from "lucide-react";
import { upgradeToProContract, signContractAction } from "./actions";

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/auth/login", locale });
  const isRtl = locale === "ar";

  let contract: any = null;
  let project: any = null;
  try {
    contract = await db.contract.findUnique({ where: { id } });
    if (contract) {
      project = await db.project.findUnique({
        where: { id: contract.projectId },
        include: {
          owner: { select: { userId: true, fullName: true } },
          award: { select: { awardedAmount: true, bid: { select: { contractor: { select: { userId: true, companyName: true } } } } } },
        },
      });
    }
  } catch (error) {
    console.error('[ContractPage] DB query failed:', error);
  }
  if (!contract || !project) {
    const msg = isRtl ? "العقد غير موجود أو حدث خطأ" : "Contract not found or error occurred";
    return (<div style={{ padding: "4rem 2rem", textAlign: "center" }}><h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{msg}</h2><Link href="/dashboard" style={{ color: "var(--primary)", marginTop: "1rem", display: "inline-block" }}>{isRtl ? "العودة" : "Back"}</Link></div>);
  }

  const isOwner = project.owner.userId === user.id;
  const isContractor = project.award?.bid?.contractor?.userId === user.id;
  if (!isOwner && !isContractor && user.role !== "ADMIN") {
    return (<div style={{ padding: "4rem 2rem", textAlign: "center" }}><h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{isRtl ? "غير مصرح" : "Access Denied"}</h2><Link href="/dashboard" style={{ color: "var(--primary)", marginTop: "1rem", display: "inline-block" }}>{isRtl ? "العودة" : "Back"}</Link></div>);
  }

  const canSign = contract.status === "PENDING_SIGNATURE";
  const ownerSigned = !!contract.ownerSignedAt;
  const contractorSigned = !!contract.contractorSignedAt;
  const defaultTerms = isRtl
    ? "شروط العقد القياسية لمنصة لاينكس فرصة.\n\n1. يلتزم المقاول بتنفيذ جميع الأعمال حسب المواصفات المتفق عليها.\n2. يتم الدفع حسب مراحل الإنجاز المحددة.\n3. مدة الضمان: 12 شهراً من تاريخ التسليم.\n4. أي نزاع يُحل ودياً أولاً، ثم عبر التحكيم.\n5. تسري أحكام النظام السعودي للمقاولات."
    : "Standard LineX Forsa platform contract terms.\n\n1. The contractor commits to executing all works per agreed specifications.\n2. Payment shall be made according to defined milestones.\n3. Warranty period: 12 months from delivery date.\n4. Any dispute shall be resolved amicably first, then via arbitration.\n5. Saudi construction regulations apply.";

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1C5963, #2A7B88)", padding: "2rem 0" }}>
        <div className="container-app">
          <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", textDecoration: "none" }}>← {isRtl ? "العودة" : "Back"}</Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText style={{ width: "24px", height: "24px" }} /> {isRtl ? "العقد" : "Contract"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>{isRtl ? (project.titleAr || project.title) : project.title}</p>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem", maxWidth: "800px" }}>
        {/* Status Cards */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{isRtl ? "نوع العقد" : "Type"}</div>
              <span className={`chip chip-${contract.contractType === "PROFESSIONAL" ? "success" : "default"}`}>
                {contract.contractType === "PROFESSIONAL" ? (isRtl ? "احترافي" : "Professional") : (isRtl ? "بسيط" : "Simple")}
              </span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{isRtl ? "الحالة" : "Status"}</div>
              <span className={`chip chip-${contract.status === "SIGNED" ? "success" : "info"}`}>
                {contract.status === "SIGNED" ? (isRtl ? "موقّع" : "Signed") : contract.status === "PENDING_SIGNATURE" ? (isRtl ? "بانتظار التوقيع" : "Pending Signature") : contract.status}
              </span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{isRtl ? "القيمة" : "Value"}</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>{project.award?.awardedAmount?.toLocaleString()} {isRtl ? "ر.س" : "SAR"}</div>
            </div>
          </div>
          {/* Upgrade to Professional */}
          {contract.contractType === "SIMPLE" && (isOwner || isContractor) && (
            <div style={{ padding: "1rem", borderRadius: "var(--radius-lg)", background: "var(--accent-light)", border: "1px solid var(--accent)", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Shield style={{ width: "18px", height: "18px", color: "var(--accent)" }} />
                <span style={{ fontSize: "0.9375rem", fontWeight: 700 }}>{isRtl ? "ترقية للعقد الاحترافي" : "Upgrade to Professional Contract"}</span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>{isRtl ? "عقد مفصّل بقوة قانونية كاملة — 150 ر.س" : "AI-drafted contract with full legal strength — 150 SAR"}</p>
              <form action={upgradeToProContract}><input type="hidden" name="contractId" value={contract.id} /><input type="hidden" name="locale" value={locale} /><button type="submit" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.8125rem" }}><Banknote style={{ width: "14px", height: "14px" }} /> {isRtl ? "ترقية مقابل 150 ر.س" : "Upgrade for 150 SAR"}</button></form>
            </div>
          )}
        </div>

        {/* Contract Terms */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem" }}>
            {isRtl ? "شروط العقد" : "Contract Terms"}
            <a href={`/api/contracts/${id}/pdf`} download style={{ float: isRtl ? "left" : "right", padding: "0.375rem 0.75rem", fontSize: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--primary)", background: "var(--primary-light)", color: "var(--primary)", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <Download style={{ width: "12px", height: "12px" }} /> {isRtl ? "تحميل PDF" : "Download PDF"}
            </a>
          </h3>
          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap", padding: "1rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>{contract.terms || defaultTerms}</div>
        </div>

        {/* Digital Signatures */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PenTool style={{ width: "18px", height: "18px", color: "var(--primary)" }} /> {isRtl ? "التوقيعات الرقمية" : "Digital Signatures"}
          </h3>
          <div className="grid md:grid-cols-2 gap-2">
            <SignatureBox label={isRtl ? "مالك المشروع" : "Project Owner"} name={project.owner.fullName} signed={ownerSigned} date={contract.ownerSignedAt} canSign={canSign && isOwner} contractId={contract.id} role="owner" isRtl={isRtl} />
            <SignatureBox label={isRtl ? "المقاول" : "Contractor"} name={project.award?.bid?.contractor?.companyName || "—"} signed={contractorSigned} date={contract.contractorSignedAt} canSign={canSign && isContractor} contractId={contract.id} role="contractor" isRtl={isRtl} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SignatureBox({ label, name, signed, date, canSign, contractId, role, isRtl }: { label: string; name: string; signed: boolean; date?: string; canSign: boolean; contractId: string; role: string; isRtl: boolean }) {
  return (
    <div style={{ padding: "1.25rem", borderRadius: "var(--radius-lg)", border: `2px solid ${signed ? "var(--primary)" : "var(--border-light)"}`, textAlign: "center" }}>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>{name}</div>
      {signed ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", color: "var(--primary)" }}>
          <CheckCircle style={{ width: "16px", height: "16px" }} />
          <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{isRtl ? "تم التوقيع" : "Signed"}</span>
          {date && <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{new Date(date).toLocaleDateString()}</div>}
        </div>
      ) : canSign ? (
        <form action={signContractAction}><input type="hidden" name="contractId" value={contractId} /><input type="hidden" name="signerRole" value={role} /><button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}><PenTool style={{ width: "14px", height: "14px" }} /> {isRtl ? "وقّع الآن" : "Sign Now"}</button></form>
      ) : (
        <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{isRtl ? "بانتظار التوقيع" : "Pending"}</span>
      )}
    </div>
  );
}