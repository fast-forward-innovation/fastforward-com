/*
 * Fast Forward — Brand Fonts
 *
 * Loaded via next/font/google with size-adjust fallback metrics, so
 * there is no font-swap layout shift. Import from your project:
 *
 *   export { manrope, jetbrainsMono } from "../brand/fonts";
 *
 * Then apply both variables on <html> in your root layout:
 *
 *   <html className={`${manrope.variable} ${jetbrainsMono.variable}`}>
 *
 * The kit's css/tokens.css references these variables via --font-sans
 * and --font-mono, so every component picks them up automatically.
 */

import { Manrope, JetBrains_Mono } from "next/font/google";

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
