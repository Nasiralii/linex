import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/** App root for Turbopack when another lockfile exists above this folder (e.g. ~/package-lock.json). */
const turbopackRoot = path.join(__dirname);
const nodeModules = path.join(turbopackRoot, "node_modules");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const imageRemotePatterns: Array<{
  protocol: "https" | "http";
  hostname: string;
  pathname?: string;
}> = [
  { protocol: "https", hostname: "*.s3.*.amazonaws.com", pathname: "/**" },
  { protocol: "https", hostname: "*.s3.amazonaws.com", pathname: "/**" },
];

const publicBase = process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL;
if (publicBase) {
  try {
    const u = new URL(publicBase);
    const proto = u.protocol === "http:" ? "http" : "https";
    imageRemotePatterns.push({
      protocol: proto,
      hostname: u.hostname,
      pathname: "/**",
    });
  } catch {
    /* invalid URL at build time — ignore */
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: turbopackRoot,
    // PostCSS @import "tailwindcss" must resolve here; `root` alone can still use the parent lockfile directory.
    resolveAlias: {
      tailwindcss: path.join(nodeModules, "tailwindcss"),
      "@tailwindcss/postcss": path.join(nodeModules, "@tailwindcss/postcss"),
    },
  },
  // Keep AWS SDK + credential chain out of the Next bundle so EC2 IMDS works.
  serverExternalPackages: [
    "@aws-sdk/client-s3",
    "@aws-sdk/credential-provider-node",
    "@aws-sdk/s3-request-presigner",
  ],
  // Security headers (production only — strict CSP + HSTS break localhost: http APIs, HMR websockets, etc.)
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; connect-src 'self' https:; frame-src 'self' https://www.google.com https://maps.google.com; frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
  // Image optimization
  images: {
    remotePatterns: imageRemotePatterns,
  },
  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default withNextIntl(nextConfig);
