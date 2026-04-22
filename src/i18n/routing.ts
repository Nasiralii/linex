import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // Arabic first (RTL primary market: Saudi Arabia)
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
});

// Lightweight wrappers around Next.js navigation APIs
// that handle the user locale automatically
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
