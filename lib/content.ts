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

const CONTENT_DIR = path.join(process.cwd(), "content");

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
  if (_settings) return _settings;
  const raw = readFileSync(path.join(CONTENT_DIR, "settings.yml"), "utf8");
  _settings = yaml.load(raw) as Settings;
  return _settings;
}

let _services: Service[] | null = null;
export function getServices(): Service[] {
  if (_services) return _services;
  const raw = readFileSync(path.join(CONTENT_DIR, "services.yml"), "utf8");
  _services = yaml.load(raw) as Service[];
  return _services;
}

export function getServiceById(id: string): Service | undefined {
  return getServices().find((s) => s.id === id);
}

// ---------------------------------------------------------------------------
// Projects (WP posts)
// ---------------------------------------------------------------------------

let _projects: Project[] | null = null;
export function getAllProjects(): Project[] {
  if (_projects) return _projects;
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
  _projects = items;
  return _projects;
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
export function getAllPages(): Page[] {
  if (_pages) return _pages;
  const files = listMdx("pages");
  _pages = files.map((f) => {
    const { data } = readMdx(f);
    return data as unknown as Page;
  });
  return _pages;
}

export function getPageBySlug(slug: string): Page | null {
  return getAllPages().find((p) => p.slug === slug) ?? null;
}
