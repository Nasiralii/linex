import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // English default for first-time visitors.
  locales: ["en", "ar"],
  defaultLocale: "en",
  localeDetection: false,
  localePrefix: "always",
});

// Lightweight wrappers around Next.js navigation APIs
// that handle the user locale automatically
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
