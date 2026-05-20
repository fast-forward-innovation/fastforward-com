import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SiteHeader } from "@/components/SiteHeader";
import { FooterBlock } from "@/components/footer/FooterBlock";
import { getSettings } from "@/lib/content";
import { manrope, jetbrainsMono } from "./fonts";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fastforward.sh";

export function generateMetadata(): Metadata {
  const s = getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: s.siteTitle,
      template: `%s — ${s.siteTitle}`,
    },
    description: s.siteDescription,
    openGraph: {
      title: s.siteTitle,
      description: s.siteDescription,
      url: SITE_URL,
      siteName: s.siteTitle,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: s.siteTitle,
      description: s.siteDescription,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { gaTrackingId } = getSettings();
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-white pt-[82px] lg:pt-[92px] xl:pt-[114px]">
        <SiteHeader />
        <main className="flex-auto">{children}</main>
        <FooterBlock />
        {gaTrackingId && <GoogleAnalytics gaId={gaTrackingId} />}
      </body>
    </html>
  );
}
