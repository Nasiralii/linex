import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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
  // Keep AWS SDK + credential chain out of the Next bundle so EC2 IMDS works.
  serverExternalPackages: [
    "@aws-sdk/client-s3",
    "@aws-sdk/credential-provider-node",
    "@aws-sdk/s3-request-presigner",
  ],
  // Security headers
  async headers() {
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
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; connect-src 'self' https:; frame-src 'self' https://www.google.com https://maps.google.com; frame-ancestors 'none'" },
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
