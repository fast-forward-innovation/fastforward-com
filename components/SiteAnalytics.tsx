"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { usePathname } from "next/navigation";

/**
 * Google Analytics everywhere except prospect reviews (/review/*). Reviews
 * are private pages sent to named people; their only tracking is our own
 * view alert (/api/review-view), with no third-party scripts.
 */
export function SiteAnalytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/review/")) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
