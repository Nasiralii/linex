import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If user is already logged in, redirect to appropriate page
  const user = await getCurrentUser();
  const locale = await getLocale();

  if (user) {
    if (user.role === "ADMIN") {
      return redirect({ href: "/admin", locale });
    }
    return redirect({ href: "/dashboard", locale });
  }

  return (
    <div
      className="bg-grid"
      style={{
        minHeight: "calc(100vh - 4rem)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1rem",
        backgroundColor: "var(--bg)",
      }}
    >
      <div style={{ width: "100%" }}>
        {children}
      </div>
    </div>
  );
}
