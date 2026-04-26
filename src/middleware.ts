import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // First handle i18n routing
  const response = intlMiddleware(request);

  // Add pathname header for landing page detection in layout
  const pathname = request.nextUrl.pathname;
  response.headers.set("x-pathname", pathname);

  return response;
}

export const config = {
  // Match all pathnames except for:
  // - API routes (/api/...)
  // - Next.js internals (_next/...)
  // - Static files (favicon.ico, images, etc.)
  matcher: ["/", "/(ar|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
