import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Rasi | راسي",
    template: "%s | Rasi",
  },
  description:
    "Trusted Construction Marketplace — Connect with verified contractors in Saudi Arabia | منصة المقاولات الإنشائية الموثوقة",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
