import type { MetadataRoute } from "next";
import { getAllPages, getAllProjects } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fastforward.sh";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Drafts resolve by direct URL (for preview sharing) but must never be
  // crawled. Case studies live at /our-work/<slug>; every other page (blog
  // posts, long-form pages) is addressed by its slug directly.
  const draftProjectPaths = getAllProjects()
    .filter((p) => p.draft)
    .map((p) => `/our-work/${p.slug}`);
  const draftPagePaths = (await getAllPages())
    .filter((p) => p.draft)
    .map((p) => `/${p.slug}`);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/contact-submitted",
          "/api/",
          ...draftProjectPaths,
          ...draftPagePaths,
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
