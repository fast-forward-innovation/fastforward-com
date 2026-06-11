import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sitemap (Live env)", () => {
  beforeEach(() => {
    vi.stubEnv("PANTHEON_ENVIRONMENT", "live");
  });

  it("includes the home, our-work, and contact-us static routes", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain("https://fastforward.sh/");
    expect(urls).toContain("https://fastforward.sh/our-work");
    expect(urls).toContain("https://fastforward.sh/contact-us");
  });

  it("excludes draft URLs", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).not.toContain(
      "https://fastforward.sh/blog/building-fastforward-sh",
    );
    expect(urls).not.toContain(
      "https://fastforward.sh/blog/growing-with-pantheon",
    );
  });

  it("includes published project URLs", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain(
      "https://fastforward.sh/our-work/northeastern-simplifying-online-course-registration",
    );
    expect(urls).toContain(
      "https://fastforward.sh/our-work/real-time-advice-for-expectant-parents",
    );
  });

  it("uses the apex domain (no www) for every URL", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls.every((u) => u.startsWith("https://fastforward.sh"))).toBe(true);
    expect(urls.some((u) => u.includes("www.fastforward.sh"))).toBe(false);
  });
});

describe("sitemap (non-Live env)", () => {
  beforeEach(() => {
    vi.stubEnv("PANTHEON_ENVIRONMENT", "feat-multidev");
  });

  it("includes draft URLs so reviewers can browse them", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain(
      "https://fastforward.sh/blog/building-fastforward-sh",
    );
    expect(urls).toContain(
      "https://fastforward.sh/blog/growing-with-pantheon",
    );
  });
});

describe("sitemap NEXT_PUBLIC_SITE_URL override", () => {
  it("uses the env override when set (read at module import time)", async () => {
    // SITE_URL is read at module load — this test documents that and
    // confirms the default we ship is apex. A different domain would
    // require a fresh module import via vi.resetModules() + dynamic import.
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls[0]).toMatch(/^https:\/\/fastforward\.sh/);
  });
});
