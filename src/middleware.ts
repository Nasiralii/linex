import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // First handle i18n routing
  const response = intlMiddleware(request);
  
  // BUG-C06: Return the i18n response directly - don't bypass it with NextResponse.next()
  // The intlMiddleware already handles locale detection and routing correctly
  return response;
}

export const config = {
  // Match all pathnames except for:
  // - API routes (/api/...)
  // - Next.js internals (_next/...)
  // - Static files (favicon.ico, images, etc.)
  matcher: [
    "/",
    "/(ar|en)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
