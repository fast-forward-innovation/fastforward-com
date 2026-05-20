import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAllProjects,
  getProjectBySlug,
  getPublishedProjects,
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
    expect(slugs).toContain("architecture-and-release-workflow");
    expect(slugs).toContain("real-time-advice-for-expectant-parents");
  });

  it("includes drafts regardless of environment", () => {
    vi.stubEnv("PANTHEON_ENVIRONMENT", "live");
    const slugs = getAllProjects().map((p) => p.slug);
    expect(slugs).toContain("building-fastforward-sh");
    expect(slugs).toContain("growing-with-pantheon");
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

describe("getPublishedProjects", () => {
  it("excludes drafts on Live", () => {
    vi.stubEnv("PANTHEON_ENVIRONMENT", "live");
    const slugs = getPublishedProjects().map((p) => p.slug);
    expect(slugs).not.toContain("building-fastforward-sh");
    expect(slugs).not.toContain("growing-with-pantheon");
  });

  it("includes drafts on non-Live (multidev, test, dev, local)", () => {
    for (const env of ["dev", "test", "feat-some-multidev", undefined]) {
      vi.stubEnv("PANTHEON_ENVIRONMENT", env as string);
      const slugs = getPublishedProjects().map((p) => p.slug);
      expect(slugs).toContain("building-fastforward-sh");
      expect(slugs).toContain("growing-with-pantheon");
    }
  });
});

describe("getProjectBySlug", () => {
  it("resolves drafts even on Live so direct URLs keep working", () => {
    vi.stubEnv("PANTHEON_ENVIRONMENT", "live");
    expect(getProjectBySlug("building-fastforward-sh")).not.toBeNull();
  });

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
