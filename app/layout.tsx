import type { Metadata } from "next";
import { manrope, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fast Forward",
  description: "Software Solutions: Design • Develop • Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
