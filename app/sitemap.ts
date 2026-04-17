import type { MetadataRoute } from "next";
import { getAllPages, getAllProjects } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fastforward.sh";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/our-work`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/contact-us`, lastModified: now, priority: 0.6 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = getAllProjects().map((p) => ({
    url: `${SITE_URL}/our-work/${p.slug}`,
    lastModified: p.date ? new Date(p.date).toISOString() : now,
    priority: 0.8,
  }));

  const pageRoutes: MetadataRoute.Sitemap = getAllPages().map((p) => ({
    url: `${SITE_URL}/${p.slug}`,
    lastModified: p.date ? new Date(p.date).toISOString() : now,
    priority: 0.5,
  }));

  return [...staticRoutes, ...projectRoutes, ...pageRoutes];
}
