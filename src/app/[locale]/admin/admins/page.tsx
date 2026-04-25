import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import AdminManagementClient from "./admin-management-client";
import { isFullAccessAdmin } from "@/lib/admin-config";

export const dynamic = "force-dynamic";

export default async function AdminManagementPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();

  if (!user) {
    return redirect({ href: "/auth/login", locale });
  }
  if (user.role !== "ADMIN") return redirect({ href: "/dashboard", locale });
  if (!isFullAccessAdmin(user.email)) return redirect({ href: "/admin/users", locale });

  const isRtl = locale === "ar";

  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, status: true, createdAt: true },
  });

  return <AdminManagementClient admins={admins} isRtl={isRtl} />;
}
