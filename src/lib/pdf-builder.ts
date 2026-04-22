import jsPDF from "jspdf";
import type { ContractData } from "./contract-pdf";

// ============================================================================
// PDF Builder — Generates jsPDF document from contract data
// Separated from route for 150-line limit compliance
// ============================================================================

export function buildContractPDF(data: ContractData): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(15, 107, 87);
  doc.rect(0, 0, w, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("LineX Forsa - Contract", w / 2, 15, { align: "center" });
  doc.setFontSize(10);
  doc.text("Construction Marketplace Platform", w / 2, 22, { align: "center" });
  const typeLabel = data.contractType === "PROFESSIONAL" ? "Professional Contract" : "Simple Contract";
  doc.text(typeLabel, w / 2, 29, { align: "center" });

  doc.setTextColor(26, 35, 50);
  let y = 45;

  // Meta line
  doc.setFontSize(8);
  doc.setTextColor(136, 136, 136);
  doc.text(`Contract ID: ${data.contractId}`, 15, y);
  doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString()}`, w - 15, y, { align: "right" });
  y += 10;

  // Section: Project Details
  y = drawSectionHeader(doc, "Project Details", y, w);
  const details = [
    ["Project:", data.projectTitle],
    ["Owner:", data.ownerName],
    ["Contractor:", data.contractorName],
    ["Award Amount:", `${data.awardedAmount.toLocaleString()} ${data.currency}`],
  ];
  doc.setFontSize(10);
  doc.setTextColor(26, 35, 50);
  for (const [label, value] of details) {
    doc.setFont("helvetica", "bold");
    doc.text(label, 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 55, y);
    y += 7;
  }
  y += 5;

  // Section: Terms
  y = drawSectionHeader(doc, "Contract Terms", y, w);
  doc.setFontSize(9);
  doc.setTextColor(51, 51, 51);
  const termsLines = doc.splitTextToSize(data.terms, w - 30);
  for (const line of termsLines) {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.text(line, 15, y);
    y += 5;
  }
  y += 10;

  // Section: Signatures
  if (y > 220) { doc.addPage(); y = 20; }
  y = drawSectionHeader(doc, "Signatures", y, w);
  const boxW = (w - 45) / 2;

  drawSignatureBox(doc, 15, y, boxW, "Project Owner", data.ownerName, data.ownerSignedAt);
  drawSignatureBox(doc, 15 + boxW + 15, y, boxW, "Contractor", data.contractorName, data.contractorSignedAt);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(170, 170, 170);
  doc.text("This contract is issued by LineX Forsa Platform — linex-forsa.vercel.app", w / 2, 285, { align: "center" });

  return Buffer.from(doc.output("arraybuffer"));
}

function drawSectionHeader(doc: jsPDF, title: string, y: number, w: number): number {
  doc.setFontSize(13);
  doc.setTextColor(15, 107, 87);
  doc.text(title, 15, y);
  y += 2;
  doc.setDrawColor(15, 107, 87);
  doc.line(15, y, w - 15, y);
  return y + 8;
}

function drawSignatureBox(
  doc: jsPDF, x: number, y: number, w: number,
  label: string, name: string, signedAt?: Date | null
) {
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(x, y, w, 35, 3, 3);
  doc.setFontSize(8);
  doc.setTextColor(136, 136, 136);
  doc.text(label, x + w / 2, y + 8, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(26, 35, 50);
  doc.setFont("helvetica", "bold");
  doc.text(name, x + w / 2, y + 16, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const sigText = signedAt ? `Signed: ${new Date(signedAt).toLocaleDateString()}` : "Pending";
  doc.setTextColor(signedAt ? 15 : 197, signedAt ? 107 : 139, signedAt ? 87 : 42);
  doc.text(sigText, x + w / 2, y + 24, { align: "center" });
}
