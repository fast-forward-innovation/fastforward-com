import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fastforward.sh";

export default function robots(): MetadataRoute.Robots {
  const draftProjectPaths = getAllProjects()
    .filter((p) => p.draft)
    .map((p) => `/our-work/${p.slug}`);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/contact-submitted", "/api/", ...draftProjectPaths],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
