/**
 * Storybook-only stand-in for `@/lib/content`. The real module reads the
 * filesystem (`content/**`) at request time, which can't run in the browser.
 * `.storybook/main.ts` aliases `@/lib/content` to this file so data-fetching
 * components render against stable in-memory fixtures.
 *
 * The exported surface mirrors `lib/content.ts`; add to it as stories need
 * more of the API.
 */
import type { Page, Project, Service, Settings } from "./types";
import {
  sampleMainSection,
  sampleImageBlockSingle,
  sampleClientQuote,
} from "./styleguide/sampleSections";

const SAMPLE_IMAGE = "/Touchscreen-1-denoise-gigapixel.jpg";

const services: Service[] = [
  { id: "strategy", name: "Strategy" },
  { id: "design", name: "Design" },
  { id: "development", name: "Development" },
  { id: "support", name: "Support" },
];

function makeProject(overrides: Partial<Project> & Pick<Project, "title" | "slug">): Project {
  return {
    date: "2024-01-01T00:00:00",
    isSticky: false,
    services: ["development", "design"],
    pageSections: [sampleMainSection, sampleImageBlockSingle, sampleClientQuote],
    cardImage: {
      src: SAMPLE_IMAGE,
      alt: overrides.title,
      width: 1000,
      height: 1150,
    },
    featuredImage: {
      src: SAMPLE_IMAGE,
      alt: overrides.title,
      width: 1600,
      height: 900,
    },
    additionalPostFields: { label: "Case Study" },
    ...overrides,
  };
}

const projects: Project[] = [
  makeProject({
    title: "A Massive Touch-Screen Exhibit",
    slug: "developing-a-massive-touch-screen-exhibit",
    excerpt: "<p>An interactive wall that thousands of visitors explore each week.</p>",
    services: ["strategy", "development"],
  }),
  makeProject({
    title: "Real-Time Advice for Expectant Parents",
    slug: "real-time-advice-for-expectant-parents",
    excerpt: "<p>A bilingual pregnancy companion delivering trustworthy guidance.</p>",
    services: ["design", "development"],
  }),
  makeProject({
    title: "A Gamified Innovation Microsite",
    slug: "demonstrating-innovation-with-a-gamified-microsite",
    excerpt: "<p>A playful microsite that made a complex product tangible.</p>",
    services: ["design", "support"],
  }),
];

const settings: Settings = {
  siteTitle: "Fast Forward",
  siteDescription: "Design. Develop. Experience.",
  postsPerPage: 10,
  gaTrackingId: "",
};

const blogPosts: Page[] = [
  {
    title: "How we ship content fast",
    slug: "blog/how-we-ship-content-fast",
    date: "2024-03-01T00:00:00",
    layout: "blog",
    featuredImage: { src: SAMPLE_IMAGE, alt: "Cover", width: 1600, height: 900 },
    author: { name: "Sam Carter", role: "Lead Engineer" },
  },
];

// --- Mirrors lib/content.ts ---------------------------------------------------

export function getSettings(): Settings {
  return settings;
}

export function getServices(): Service[] {
  return services;
}

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function getAllProjects(): Project[] {
  return projects;
}

export function getProjectBySlug(slug: string): Project | null {
  return projects.find((p) => p.slug === slug) ?? null;
}

export function getPublishedProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(n = 4): Project[] {
  return projects.slice(0, n);
}

export function getPaginatedProjects(page: number, perPage = 10) {
  const totalPages = Math.max(1, Math.ceil(projects.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    items: projects.slice(start, start + perPage),
    total: projects.length,
    totalPages,
    page: safePage,
    perPage,
  };
}

export async function getAllPages(): Promise<Page[]> {
  return blogPosts;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  return blogPosts.find((p) => p.slug === slug) ?? null;
}

export async function getPublishedPages(): Promise<Page[]> {
  return blogPosts;
}

export async function getBlogPosts(): Promise<Page[]> {
  return blogPosts;
}
