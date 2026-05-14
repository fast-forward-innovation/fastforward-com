import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import type {
  Project,
  Page,
  Service,
  Settings,
} from "./types";
import { fetchLabProjectPages } from "./pcc";

const CONTENT_DIR = path.join(process.cwd(), "content");

// In-process caches are skipped in dev so edits to content/*.{mdx,yml}
// are picked up on the next request without restarting the server.
const CACHE_ENABLED = process.env.NODE_ENV === "production";

function readMdx(filePath: string): { data: Record<string, unknown>; content: string } {
  const raw = readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { data: data as Record<string, unknown>, content };
}

function listMdx(subdir: string): string[] {
  try {
    return readdirSync(path.join(CONTENT_DIR, subdir))
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => path.join(CONTENT_DIR, subdir, f));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Settings + services (singletons)
// ---------------------------------------------------------------------------

let _settings: Settings | null = null;
export function getSettings(): Settings {
  if (CACHE_ENABLED && _settings) return _settings;
  const raw = readFileSync(path.join(CONTENT_DIR, "settings.yml"), "utf8");
  const parsed = yaml.load(raw) as Settings;
  if (CACHE_ENABLED) _settings = parsed;
  return parsed;
}

let _services: Service[] | null = null;
export function getServices(): Service[] {
  if (CACHE_ENABLED && _services) return _services;
  const raw = readFileSync(path.join(CONTENT_DIR, "services.yml"), "utf8");
  const parsed = yaml.load(raw) as Service[];
  if (CACHE_ENABLED) _services = parsed;
  return parsed;
}

export function getServiceById(id: string): Service | undefined {
  return getServices().find((s) => s.id === id);
}

// ---------------------------------------------------------------------------
// Projects (WP posts)
// ---------------------------------------------------------------------------

let _projects: Project[] | null = null;
export function getAllProjects(): Project[] {
  if (CACHE_ENABLED && _projects) return _projects;
  const files = listMdx("projects");
  const items = files.map((f) => {
    const { data } = readMdx(f);
    return data as unknown as Project;
  });
  // Sticky first, then newest date first.
  items.sort((a, b) => {
    if (a.isSticky !== b.isSticky) return a.isSticky ? -1 : 1;
    return (b.date || "").localeCompare(a.date || "");
  });
  if (CACHE_ENABLED) _projects = items;
  return items;
}

export function getProjectBySlug(slug: string): Project | null {
  return getAllProjects().find((p) => p.slug === slug) ?? null;
}

export function getFeaturedProjects(n = 4): Project[] {
  return getAllProjects().slice(0, n);
}

export function getPaginatedProjects(
  page: number,
  perPage?: number,
): { items: Project[]; total: number; totalPages: number; page: number; perPage: number } {
  const all = getAllProjects();
  const resolvedPerPage = perPage ?? getSettings().postsPerPage ?? 10;
  const totalPages = Math.max(1, Math.ceil(all.length / resolvedPerPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * resolvedPerPage;
  return {
    items: all.slice(start, start + resolvedPerPage),
    total: all.length,
    totalPages,
    page: safePage,
    perPage: resolvedPerPage,
  };
}

// ---------------------------------------------------------------------------
// Pages (WP pages)
// ---------------------------------------------------------------------------

let _pages: Page[] | null = null;
export async function getAllPages(): Promise<Page[]> {
  if (CACHE_ENABLED && _pages) return _pages;

  // MDX-derived pages (authoritative; collisions resolve in their favor).
  const files = listMdx("pages");
  const mdx: Page[] = files.map((f) => {
    const { data } = readMdx(f);
    return { ...(data as unknown as Page), source: "mdx" };
  });

  // PCC-derived lab project pages. Gracefully empty when PCC_SITE_ID/TOKEN
  // aren't set, so this works at build time before Pantheon is wired up.
  const pcc = await fetchLabProjectPages();

  const mdxSlugs = new Set(mdx.map((p) => p.slug));
  const merged = [
    ...mdx,
    ...pcc.filter((p) => {
      if (mdxSlugs.has(p.slug)) {
        console.warn(
          `[content] slug "${p.slug}" exists in MDX and PCC — MDX wins`,
        );
        return false;
      }
      return true;
    }),
  ];

  if (CACHE_ENABLED) _pages = merged;
  return merged;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  return (await getAllPages()).find((p) => p.slug === slug) ?? null;
}
