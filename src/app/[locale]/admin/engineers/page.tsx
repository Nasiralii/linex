import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

// Redirect to unified admin/users page which handles all user types
export default async function AdminEngineersPage() {
  const locale = await getLocale();
  return redirect({ href: "/admin/users", locale });
}
