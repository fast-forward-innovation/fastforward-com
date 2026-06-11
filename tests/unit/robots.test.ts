import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function firstRule(result: Awaited<ReturnType<typeof robots>>) {
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
  return rules[0];
}

describe("robots (Live env)", () => {
  beforeEach(() => {
    vi.stubEnv("PANTHEON_ENVIRONMENT", "live");
  });

  it("disallows every draft URL", async () => {
    const rule = firstRule(await robots());
    const disallow = Array.isArray(rule.disallow)
      ? rule.disallow
      : [rule.disallow].filter(Boolean);
    expect(disallow).toContain("/blog/building-fastforward-sh");
    expect(disallow).toContain("/blog/growing-with-pantheon");
  });

  it("disallows /contact-submitted and /api/", async () => {
    const rule = firstRule(await robots());
    const disallow = Array.isArray(rule.disallow)
      ? rule.disallow
      : [rule.disallow].filter(Boolean);
    expect(disallow).toContain("/contact-submitted");
    expect(disallow).toContain("/api/");
  });

  it("uses the apex domain for the sitemap pointer", async () => {
    const sitemap = (await robots()).sitemap;
    const sitemapUrl = Array.isArray(sitemap) ? sitemap[0] : sitemap;
    expect(sitemapUrl).toBe("https://fastforward.sh/sitemap.xml");
  });

  it("targets all user agents", async () => {
    const rule = firstRule(await robots());
    expect(rule.userAgent).toBe("*");
  });
});
