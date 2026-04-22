// ============================================================================
// Contract PDF Generation — HTML template for server-side PDF
// ============================================================================

export interface ContractData {
  contractId: string;
  contractType: string;
  projectTitle: string;
  projectTitleAr?: string;
  ownerName: string;
  contractorName: string;
  awardedAmount: number;
  currency: string;
  terms: string;
  ownerSignedAt?: Date | null;
  contractorSignedAt?: Date | null;
  createdAt: Date;
  projectType?: string;
  location?: string;
}

export function generateContractHTML(data: ContractData): string {
  const formatDate = (d: Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : "—";

  const statusText = data.ownerSignedAt && data.contractorSignedAt
    ? "موقّع / Signed" : "بانتظار التوقيع / Pending Signature";

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #1a2332; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 3px solid #0f6b57; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { font-size: 24px; color: #0f6b57; margin-bottom: 4px; }
  .header p { font-size: 12px; color: #888; }
  .badge { display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; }
  .badge-pro { background: #e8f5e9; color: #0f6b57; }
  .badge-simple { background: #f5f5f5; color: #666; }
  .section { margin-bottom: 24px; }
  .section h2 { font-size: 16px; color: #0f6b57; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; margin-bottom: 12px; }
  .grid { display: flex; gap: 20px; flex-wrap: wrap; }
  .grid-item { flex: 1; min-width: 200px; }
  .label { font-size: 11px; color: #888; margin-bottom: 2px; }
  .value { font-size: 14px; font-weight: 600; }
  .terms { background: #fafafa; padding: 20px; border-radius: 8px; font-size: 13px; line-height: 2; white-space: pre-wrap; border: 1px solid #eee; }
  .sigs { display: flex; gap: 40px; margin-top: 20px; }
  .sig-box { flex: 1; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; text-align: center; min-height: 120px; }
  .sig-box.signed { border-color: #0f6b57; }
  .sig-label { font-size: 11px; color: #888; margin-bottom: 8px; }
  .sig-name { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
  .sig-status { font-size: 12px; }
  .sig-status.done { color: #0f6b57; font-weight: 700; }
  .sig-status.pending { color: #c58b2a; }
  .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
  .amount { font-size: 22px; font-weight: 800; color: #0f6b57; }
</style></head>
<body>
  <div class="header">
    <h1>لاينكس فرصة — LineX Forsa</h1>
    <p>منصة سوق البناء — Construction Marketplace</p>
    <div style="margin-top: 8px;">
      <span class="badge ${data.contractType === "PROFESSIONAL" ? "badge-pro" : "badge-simple"}">
        ${data.contractType === "PROFESSIONAL" ? "عقد احترافي / Professional" : "عقد بسيط / Simple"}
      </span>
      <span class="badge" style="background:#fff3e0;color:#c58b2a;margin-right:8px;">${statusText}</span>
    </div>
  </div>

  <div class="section">
    <h2>تفاصيل المشروع / Project Details</h2>
    <div class="grid">
      <div class="grid-item">
        <div class="label">اسم المشروع / Project Title</div>
        <div class="value">${data.projectTitleAr || data.projectTitle}</div>
        ${data.projectTitleAr ? `<div style="font-size:12px;color:#666;">${data.projectTitle}</div>` : ""}
      </div>
      <div class="grid-item">
        <div class="label">رقم العقد / Contract ID</div>
        <div class="value" style="font-size:11px;">${data.contractId}</div>
      </div>
    </div>
    <div class="grid" style="margin-top:12px;">
      <div class="grid-item">
        <div class="label">تاريخ العقد / Contract Date</div>
        <div class="value">${formatDate(data.createdAt)}</div>
      </div>
      <div class="grid-item">
        <div class="label">قيمة الترسية / Award Amount</div>
        <div class="amount">${data.awardedAmount.toLocaleString()} ${data.currency}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>أطراف العقد / Contract Parties</h2>
    <div class="grid">
      <div class="grid-item">
        <div class="label">الطرف الأول — مالك المشروع / Project Owner</div>
        <div class="value">${data.ownerName}</div>
      </div>
      <div class="grid-item">
        <div class="label">الطرف الثاني — المقاول / Contractor</div>
        <div class="value">${data.contractorName}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>شروط العقد / Contract Terms</h2>
    <div class="terms">${data.terms}</div>
  </div>

  <div class="section">
    <h2>التوقيعات / Signatures</h2>
    <div class="sigs">
      <div class="sig-box ${data.ownerSignedAt ? "signed" : ""}">
        <div class="sig-label">مالك المشروع / Project Owner</div>
        <div class="sig-name">${data.ownerName}</div>
        <div class="sig-status ${data.ownerSignedAt ? "done" : "pending"}">
          ${data.ownerSignedAt ? `✓ تم التوقيع ${formatDate(data.ownerSignedAt)}` : "⏳ بانتظار التوقيع"}
        </div>
      </div>
      <div class="sig-box ${data.contractorSignedAt ? "signed" : ""}">
        <div class="sig-label">المقاول / Contractor</div>
        <div class="sig-name">${data.contractorName}</div>
        <div class="sig-status ${data.contractorSignedAt ? "done" : "pending"}">
          ${data.contractorSignedAt ? `✓ تم التوقيع ${formatDate(data.contractorSignedAt)}` : "⏳ بانتظار التوقيع"}
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>هذا العقد صادر من منصة لاينكس فرصة — This contract is issued by LineX Forsa Platform</p>
    <p style="margin-top:4px;">linex-forsa.vercel.app</p>
  </div>
</body></html>`;
}
