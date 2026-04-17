import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { FooterBlock } from "@/components/footer/FooterBlock";
import { getSettings } from "@/lib/content";
import { manrope, jetbrainsMono } from "./fonts";
import "./globals.css";

export function generateMetadata(): Metadata {
  const s = getSettings();
  return {
    title: s.siteTitle,
    description: s.siteDescription,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-white">
        <SiteHeader />
        <div className="relative top-[82px] lg:top-[92px] xl:top-[114px]">
          <main className="mb-auto">{children}</main>
          <FooterBlock />
        </div>
      </body>
    </html>
  );
}
