import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "FanMap — Which nation will own the FanMap?",
  description:
    "Join your nation, get your free supporter card, and help your colors grow across the world. An independent fan map for the 2026 football summer.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://fanmap.example"
  ),
  openGraph: {
    title: "FanMap — Join your nation. Grow the map.",
    description:
      "The independent global fan race for the 2026 football summer. Pick your nation, get a free supporter card, paint the world.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "FanMap — Join your nation. Grow the map.",
    description:
      "The independent global fan race for the 2026 football summer."
  }
};

export const viewport: Viewport = {
  themeColor: "#05060A",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
