"use server";

import { db } from "@/lib/db";
import { hashPassword, verifyPassword, getCurrentUser } from "@/lib/auth";
import { isFullAccessAdmin } from "@/lib/admin-config";
import { revalidatePath } from "next/cache";

export async function addAdmin(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || !isFullAccessAdmin(user.email)) {
    throw new Error("FORBIDDEN: Full access admin only");
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || password.length < 8) {
    throw new Error("Invalid input");
  }

  const existing = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    throw new Error("Email already exists");
  }

  const passwordHash = await hashPassword(password);

  await db.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
    },
  });

  revalidatePath("/admin/admins");
}

export async function deleteAdmin(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || !isFullAccessAdmin(user.email)) {
    throw new Error("FORBIDDEN: Full access admin only");
  }

  const userId = formData.get("userId") as string;
  const hardDelete = formData.get("hardDelete") === "true";

  if (userId === user.id) {
    throw new Error("Cannot delete yourself");
  }

  const targetUser = await db.user.findUnique({ where: { id: userId } });
  if (!targetUser || targetUser.role !== "ADMIN") {
    throw new Error("User not found or not an admin");
  }

  // Prevent deleting full access admins
  if (isFullAccessAdmin(targetUser.email)) {
    throw new Error("Cannot delete full access admin");
  }

  if (hardDelete) {
    // Complete deletion from database
    await db.user.delete({ where: { id: userId } });
  } else {
    // Just deactivate
    await db.user.update({
      where: { id: userId },
      data: { status: "DEACTIVATED" },
    });
  }

  revalidatePath("/admin/admins");
}

export async function toggleAdminStatus(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || !isFullAccessAdmin(user.email)) {
    throw new Error("FORBIDDEN: Full access admin only");
  }

  const userId = formData.get("userId") as string;

  if (userId === user.id) {
    throw new Error("Cannot change your own status");
  }

  const targetUser = await db.user.findUnique({ where: { id: userId } });
  if (!targetUser || targetUser.role !== "ADMIN") {
    throw new Error("User not found or not an admin");
  }

  // Prevent changing full access admin status
  if (isFullAccessAdmin(targetUser.email)) {
    throw new Error("Cannot change full access admin status");
  }

  const newStatus = targetUser.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";

  await db.user.update({
    where: { id: userId },
    data: { status: newStatus },
  });

  revalidatePath("/admin/admins");
}

export async function updateAdminPassword(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("FORBIDDEN: Admin only");
  }

  const userId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  // Full access admin can update any admin password
  // Limited access admin can only update their own password
  if (!isFullAccessAdmin(user.email) && userId !== user.id) {
    throw new Error("FORBIDDEN: Can only update your own password");
  }

  const passwordHash = await hashPassword(newPassword);

  await db.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  revalidatePath("/admin/admins");
}
