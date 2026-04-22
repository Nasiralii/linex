import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { type ContractData } from "@/lib/contract-pdf";
import { buildContractPDF } from "@/lib/pdf-builder";

// ============================================================================
// Gap 4: Server-Side PDF Generation for Contracts
// GET /api/contracts/[id]/pdf → downloadable PDF
// ============================================================================

const DEFAULT_TERMS = [
  "1. يلتزم المقاول بتنفيذ جميع الأعمال حسب المواصفات المتفق عليها.",
  "2. يتم الدفع حسب مراحل الإنجاز المحددة.",
  "3. مدة الضمان: 12 شهراً من تاريخ التسليم.",
  "4. أي نزاع يُحل ودياً أولاً، ثم عبر التحكيم.",
  "5. تسري أحكام النظام السعودي للمقاولات.",
].join("\n");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contract = await db.contract.findUnique({ where: { id } });
  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const project = await db.project.findUnique({
    where: { id: contract.projectId },
    include: {
      owner: { select: { userId: true, fullName: true, companyName: true } },
      award: {
        select: {
          awardedAmount: true,
          bid: {
            select: {
              contractor: {
                select: { userId: true, companyName: true },
              },
            },
          },
        },
      },
    },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Auth: only owner, contractor, or admin
  const isOwner = project.owner.userId === user.id;
  const isContractor = project.award?.bid?.contractor?.userId === user.id;
  if (!isOwner && !isContractor && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contractData: ContractData = {
    contractId: contract.id,
    contractType: contract.contractType,
    projectTitle: project.title,
    projectTitleAr: project.titleAr || undefined,
    ownerName: project.owner.fullName || project.owner.companyName || "—",
    contractorName: project.award?.bid?.contractor?.companyName || "—",
    awardedAmount: project.award?.awardedAmount || 0,
    currency: contract.currency,
    terms: contract.terms || DEFAULT_TERMS,
    ownerSignedAt: contract.ownerSignedAt,
    contractorSignedAt: contract.contractorSignedAt,
    createdAt: contract.createdAt,
    projectType: project.projectType,
  };

  const pdfBuffer = buildContractPDF(contractData);
  const filename = `contract-${contract.id.slice(0, 8)}.pdf`;

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-cache",
    },
  });
}
