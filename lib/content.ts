import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import type {
  Project,
  Page,
  Principal,
  Review,
  ReviewSection,
  Service,
  Settings,
} from "./types";
import { fetchLabProjectPages } from "./pcc";
import { isLiveEnvironment } from "./env";

const CONTENT_DIR = path.join(process.cwd(), "content");

// In-process caches are skipped in dev so edits to content/*.{mdx,yml}
// are picked up on the next request without restarting the server.
const CACHE_ENABLED = process.env.NODE_ENV === "production";

function readMdx(filePath: string): { data: Record<string, unknown>; content: string } {
  const raw = readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { data: data as Record<string, unknown>, content };
}

// Walks `subdir` recursively so section content can live in nested folders
// (e.g. content/pages/experiences/*.mdx). Routing is slug-driven, so the
// directory layout is purely organizational.
function listMdx(subdir: string): string[] {
  const root = path.join(CONTENT_DIR, subdir);
  const out: string[] = [];
  const walk = (dir: string) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".mdx")) out.push(full);
    }
  };
  walk(root);
  return out;
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

/**
 * Projects intended for public surfaces (home page, /our-work index,
 * sitemap). On Live, filters out drafts; on every other environment
 * (multidev, test, dev, local) returns everything so reviewers can
 * browse in-progress work. getAllProjects() remains unfiltered either
 * way so draft URLs continue to resolve for preview-sharing.
 */
export function getPublishedProjects(): Project[] {
  if (!isLiveEnvironment()) return getAllProjects();
  return getAllProjects().filter((p) => !p.draft);
}

export function getFeaturedProjects(n = 4): Project[] {
  return getPublishedProjects().slice(0, n);
}

export function getPaginatedProjects(
  page: number,
  perPage?: number,
): { items: Project[]; total: number; totalPages: number; page: number; perPage: number } {
  const all = getPublishedProjects();
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

/**
 * Pages intended for public surfaces (sitemap). On Live, filters out
 * drafts; on every other environment returns everything so reviewers can
 * browse in-progress work. getAllPages() stays unfiltered either way so
 * draft URLs continue to resolve for preview-sharing.
 */
export async function getPublishedPages(): Promise<Page[]> {
  const all = await getAllPages();
  if (!isLiveEnvironment()) return all;
  return all.filter((p) => !p.draft);
}

/**
 * Blog posts for the /blog auto-listing index. Includes both the simple
 * `blog` template and the `blog-case-study` template. Draft-aware like
 * getPublishedPages (drafts hidden on Live, visible elsewhere). Sorted
 * pinned-first, then newest date first — mirroring the isSticky sort in
 * getAllProjects().
 */
export async function getBlogPosts(): Promise<Page[]> {
  const posts = (await getPublishedPages()).filter(
    (p) => p.layout === "blog" || p.layout === "blog-case-study",
  );
  return posts.sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return (b.date || "").localeCompare(a.date || "");
  });
}

// ---------------------------------------------------------------------------
// Prospect site reviews (content/reviews/*.mdx → /review/<slug>)
// ---------------------------------------------------------------------------

let _principals: Principal[] | null = null;
export function getPrincipals(): Principal[] {
  if (CACHE_ENABLED && _principals) return _principals;
  let parsed: Principal[] = [];
  try {
    const raw = readFileSync(path.join(CONTENT_DIR, "principals.yml"), "utf8");
    parsed = (yaml.load(raw) as Principal[] | null) ?? [];
  } catch {
    parsed = [];
  }
  if (CACHE_ENABLED) _principals = parsed;
  return parsed;
}

export function getPrincipal(id: string): Principal | undefined {
  return getPrincipals().find((p) => p.id === id);
}

/** Visitor IDs ride in a query string, so keep them short and URL-safe. */
const RECIPIENT_ID = /^[a-z0-9]{6,32}$/;
const REVIEW_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Throws on a review that would publish broken: an unknown principal, a
 * slug that isn't a single kebab-case segment, or recipient IDs that are
 * malformed or duplicated (two people sharing a personal link). Runs at
 * load, so `npm run build` fails rather than shipping it.
 */
export function validateReview(review: Review, file = review.slug): void {
  const where = `[content] review ${file}`;
  if (!review.slug || !REVIEW_SLUG.test(review.slug)) {
    throw new Error(`${where}: slug "${review.slug}" must be kebab-case with no slashes`);
  }
  if (!review.prospect?.name) {
    throw new Error(`${where}: prospect.name is required`);
  }
  if (!getPrincipal(review.principal)) {
    const known = getPrincipals().map((p) => p.id).join(", ") || "none";
    throw new Error(
      `${where}: principal "${review.principal}" is not in content/principals.yml (known: ${known})`,
    );
  }
  const seen = new Set<string>();
  for (const r of review.recipients ?? []) {
    if (!RECIPIENT_ID.test(String(r.id))) {
      throw new Error(`${where}: recipient id "${r.id}" must be 6-32 lowercase letters/digits`);
    }
    if (seen.has(r.id)) {
      throw new Error(`${where}: recipient id "${r.id}" is used twice`);
    }
    seen.add(r.id);
  }
  if (!review.draft) {
    const unfilled = findUnfilledPlaceholders(review);
    if (unfilled.length > 0) {
      throw new Error(
        `${where}: can't publish with ${unfilled.length} unfilled placeholder(s) (class="fill"): ${unfilled.join(" | ")}. Fill them, or keep draft: true.`,
      );
    }
  }
}

const REVIEWS_DIR = path.join(CONTENT_DIR, "reviews");

/**
 * Text of every element marked `class="fill"`: the convention for a
 * placeholder still waiting on real copy (yellow-highlighted, bracketed).
 * A review can't be published while any remain.
 */
export function findUnfilledPlaceholders(review: Review): string[] {
  const found: string[] = [];
  const pattern = /<([a-z0-9]+)\b[^>]*\bclass="(?:[^"]*\s)?fill(?:\s[^"]*)?"[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const section of review.pageSections ?? []) {
    const html =
      section.type === "HtmlEmbed"
        ? (section.html ?? "")
        : section.type === "Prose"
          ? section.html
          : section.type === "MainSection"
            ? (section.richText ?? "")
            : "";
    for (const m of html.matchAll(pattern)) {
      found.push(m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
    }
  }
  return found;
}

/** Read each `HtmlEmbed` file into the section, refusing paths outside content/reviews/. */
export function resolveEmbeds(sections: ReviewSection[] | undefined, where: string): void {
  for (const section of sections ?? []) {
    if (section.type !== "HtmlEmbed") continue;
    const file = path.resolve(REVIEWS_DIR, section.src ?? "");
    if (!file.startsWith(REVIEWS_DIR + path.sep) || !file.endsWith(".html")) {
      throw new Error(`${where}: HtmlEmbed src "${section.src}" must be an .html file under content/reviews/`);
    }
    try {
      section.html = readFileSync(file, "utf8");
    } catch {
      throw new Error(`${where}: HtmlEmbed src "${section.src}" not found`);
    }
  }
}

let _reviews: Review[] | null = null;
/**
 * All reviews, drafts included. Reviews are unlisted by design: they are
 * never added to the sitemap, llms.txt, or any index, and every one is
 * noindex — the only way in is a link we sent.
 */
export function getAllReviews(): Review[] {
  if (CACHE_ENABLED && _reviews) return _reviews;
  const items = listMdx("reviews").map((f) => {
    const review = readMdx(f).data as unknown as Review;
    const where = path.relative(CONTENT_DIR, f);
    resolveEmbeds(review.pageSections, `[content] review ${where}`);
    validateReview(review, where);
    return review;
  });
  const slugs = new Set<string>();
  for (const r of items) {
    if (slugs.has(r.slug)) {
      throw new Error(`[content] two reviews use the slug "${r.slug}"`);
    }
    slugs.add(r.slug);
  }
  if (CACHE_ENABLED) _reviews = items;
  return items;
}

export function getReviewBySlug(slug: string): Review | null {
  return getAllReviews().find((r) => r.slug === slug) ?? null;
}
