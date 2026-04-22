"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect as nextRedirect } from "next/navigation";
import { createContractPayment } from "@/lib/payment";

export async function upgradeToProContract(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const contractId = formData.get("contractId") as string;
  const locale = (formData.get("locale") as string) || "ar";

  try {
    const contract = await db.contract.findUnique({ where: { id: contractId } });
    if (!contract || contract.contractType === "PROFESSIONAL") return;

    const session = await createContractPayment(
      user.id,
      contractId,
      user.email,
      user.email.split("@")[0],
      locale,
    );

    if (session.paymentUrl) {
      nextRedirect(session.paymentUrl);
    }
  } catch (error) {
    console.error('[upgradeToProContract] DB query failed:', error);
  }

  revalidatePath(`/dashboard/contracts/${contractId}`);
}

export async function signContractAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const contractId = formData.get("contractId") as string;
  const role = formData.get("signerRole") as string;

  try {
    const updateData: any = {};
    if (role === "owner") {
      updateData.ownerSignedAt = new Date();
    } else if (role === "contractor") {
      updateData.contractorSignedAt = new Date();
    }

    const contract = await db.contract.findUnique({ where: { id: contractId } });
    if (!contract) return;

    await db.contract.update({ where: { id: contractId }, data: updateData });

    const updated = await db.contract.findUnique({ where: { id: contractId } });
    if (updated?.ownerSignedAt && updated?.contractorSignedAt) {
      await db.contract.update({ where: { id: contractId }, data: { status: "SIGNED" } });
    }
  } catch (error) {
    console.error('[signContractAction] DB query failed:', error);
  }

  revalidatePath(`/dashboard/contracts/${contractId}`);
}
