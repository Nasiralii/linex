import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AiChatWidget } from "@/components/ai-chat";
import { ToastProvider } from "@/components/toast";

export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Check if we're on the landing page
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isLandingPage = pathname.includes("/landing") || pathname === `/${locale}` || pathname === "/";

  // ONLY use JWT cookie — NO DB queries in layout
  // This prevents layout crashes when DB connection pool is exhausted
  let authUser: { email: string; role: string; notificationCount?: number } | null = null;

  try {
    const user = await getCurrentUser();
    if (user) {
      authUser = {
        email: user.email,
        role: user.role,
        notificationCount: 0, // Fetched client-side via /api/auth/me
      };
    }
  } catch {
    // Auth failed — no user, layout still renders
  }

  return (
    <div lang={locale} dir={dir} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ToastProvider>
          {!isLandingPage && <Navbar initialUser={authUser} />}
          <main style={{ flex: 1 }}>{children}</main>
          {!isLandingPage && <Footer />}
          {!isLandingPage && <AiChatWidget />}
        </ToastProvider>
      </NextIntlClientProvider>
    </div>
  );
}
