import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAllPages,
  getAllProjects,
  getPageBySlug,
  getProjectBySlug,
  getPublishedPages,
  getSettings,
} from "@/lib/content";

// Caching in lib/content is gated on NODE_ENV === "production"; vitest runs
// with NODE_ENV=test by default, so env stubs are picked up on every call.
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getAllProjects", () => {
  it("returns at least the MDX projects we know exist", () => {
    const projects = getAllProjects();
    expect(projects.length).toBeGreaterThan(0);
    const slugs = projects.map((p) => p.slug);
    expect(slugs).toContain("northeastern-simplifying-online-course-registration");
    expect(slugs).toContain("real-time-advice-for-expectant-parents");
  });

  it("orders sticky projects first, then by date desc", () => {
    const projects = getAllProjects();
    // First non-sticky project should come after every sticky one.
    const firstNonSticky = projects.findIndex((p) => !p.isSticky);
    if (firstNonSticky === -1) return;
    expect(
      projects.slice(0, firstNonSticky).every((p) => p.isSticky),
    ).toBe(true);
  });
});

// Draft content lives in pages now (the blog), so the draft-visibility rules
// are exercised through the page loaders. getAllPages is unfiltered; the
// environment gate lives in getPublishedPages.
describe("getAllPages", () => {
  it("includes draft pages regardless of environment", async () => {
    vi.stubEnv("PANTHEON_ENVIRONMENT", "live");
    const slugs = (await getAllPages()).map((p) => p.slug);
    expect(slugs).toContain("blog/building-fastforward-sh");
    expect(slugs).toContain("blog/growing-with-pantheon");
  });
});

describe("getPublishedPages", () => {
  it("excludes drafts on Live", async () => {
    vi.stubEnv("PANTHEON_ENVIRONMENT", "live");
    const slugs = (await getPublishedPages()).map((p) => p.slug);
    expect(slugs).not.toContain("blog/building-fastforward-sh");
    expect(slugs).not.toContain("blog/growing-with-pantheon");
  });

  it("includes drafts on non-Live (multidev, test, dev, local)", async () => {
    for (const env of ["dev", "test", "feat-some-multidev", undefined]) {
      vi.stubEnv("PANTHEON_ENVIRONMENT", env as string);
      const slugs = (await getPublishedPages()).map((p) => p.slug);
      expect(slugs).toContain("blog/building-fastforward-sh");
      expect(slugs).toContain("blog/growing-with-pantheon");
    }
  });
});

describe("getPageBySlug", () => {
  it("resolves draft pages even on Live so direct URLs keep working", async () => {
    vi.stubEnv("PANTHEON_ENVIRONMENT", "live");
    expect(await getPageBySlug("blog/building-fastforward-sh")).not.toBeNull();
  });
});

describe("getProjectBySlug", () => {
  it("returns null for unknown slugs", () => {
    expect(getProjectBySlug("does-not-exist-anywhere")).toBeNull();
  });
});

describe("getSettings", () => {
  it("reads content/settings.yml with expected fields", () => {
    const s = getSettings();
    expect(s.siteTitle).toBe("Fast Forward");
    expect(s.siteDescription).toMatch(/Design.*Develop.*Experience/);
    expect(typeof s.postsPerPage).toBe("number");
  });
});
