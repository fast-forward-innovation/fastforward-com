import { expect, test } from "@playwright/test";

const APEX = "https://fastforward.sh";

test.describe("SEO meta tags", () => {
  test("home page has title and meta description from siteDescription", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Fast Forward/);
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description).toMatch(/Design.*Develop.*Experience/);
  });

  test("home page Open Graph tags point at apex", async ({ page }) => {
    await page.goto("/");
    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    expect(ogTitle).toBeTruthy();
    const ogUrl = await page
      .locator('meta[property="og:url"]')
      .first()
      .getAttribute("content");
    // metadataBase is set from NEXT_PUBLIC_SITE_URL (apex in test config).
    expect(ogUrl ?? "").not.toContain("www.fastforward.sh");
  });

  test("project page with excerpt uses it as meta description (HTML stripped)", async ({ page }) => {
    await page.goto("/our-work/real-time-advice-for-expectant-parents");
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description).toContain("pregnancy resource from a printed booklet");
    expect(description).not.toContain("<p>");
  });

  test("every published project page emits a non-empty meta description", async ({ page, request }) => {
    // This is the load-bearing invariant from the SEO audit that prompted
    // the metadata-fallback work: no published project should ship with a
    // missing/empty description. Scrape the sitemap for the canonical list
    // of published project URLs and assert on each.
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const urls = Array.from(sitemap.matchAll(/<loc>([^<]+\/our-work\/[^<]+)<\/loc>/g))
      .map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      const path = new URL(url).pathname;
      await page.goto(path);
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(description, `missing description on ${path}`).toBeTruthy();
      expect(description?.trim().length, `empty description on ${path}`).toBeGreaterThan(0);
    }
  });

  test("draft page (direct URL) renders with noindex meta", async ({ page }) => {
    // On Live, draft slugs still resolve so previews can be shared, but the
    // page must carry noindex,nofollow so search engines won't index it.
    const response = await page.goto("/blog/building-fastforward-sh");
    expect(response?.status()).toBe(200);
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute("content");
    expect(robots ?? "").toMatch(/noindex/i);
    expect(robots ?? "").toMatch(/nofollow/i);
  });
});

test.describe("sitemap.xml", () => {
  test("is XML and uses apex URLs", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/xml/);
    const body = await res.text();
    expect(body).toContain(`${APEX}/`);
    expect(body).not.toContain("www.fastforward.sh");
  });

  test("excludes draft URLs on Live", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    expect(body).not.toContain("/blog/building-fastforward-sh");
    expect(body).not.toContain("/blog/growing-with-pantheon");
  });

  test("includes published project URLs", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    expect(body).toContain("/our-work/northeastern-simplifying-online-course-registration");
    expect(body).toContain("/our-work/real-time-advice-for-expectant-parents");
  });
});

test.describe("robots.txt", () => {
  test("declares apex sitemap and disallows drafts", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/User-Agent:\s*\*/i);
    expect(body).toContain(`Sitemap: ${APEX}/sitemap.xml`);
    expect(body).toMatch(/Disallow:\s*\/blog\/building-fastforward-sh/);
    expect(body).toMatch(/Disallow:\s*\/blog\/growing-with-pantheon/);
    expect(body).toMatch(/Disallow:\s*\/contact-submitted/);
    expect(body).toMatch(/Disallow:\s*\/api\//);
  });
});

test.describe("llms.txt", () => {
  test("is markdown with apex URLs and no drafts", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/markdown/);
    const body = await res.text();
    expect(body.split("\n")[0]).toBe("# Fast Forward");
    expect(body).toContain(`${APEX}/our-work/northeastern-simplifying-online-course-registration`);
    expect(body).not.toContain("www.fastforward.sh");
    expect(body).not.toContain("building-fastforward-sh");
    expect(body).not.toContain("lab-project-sample");
  });
});

test.describe("Security headers", () => {
  test("Strict-Transport-Security present on the home page", async ({ request }) => {
    const res = await request.get("/");
    const hsts = res.headers()["strict-transport-security"];
    expect(hsts).toBeTruthy();
    expect(hsts).toMatch(/max-age=\d{6,}/);
    expect(hsts).toMatch(/includeSubDomains/i);
  });

  test("Strict-Transport-Security present on a project page", async ({ request }) => {
    const res = await request.get("/our-work/northeastern-simplifying-online-course-registration");
    expect(res.headers()["strict-transport-security"]).toBeTruthy();
  });
});

test.describe("Static asset caching", () => {
  test("Next /_next/static/* assets are served with immutable Cache-Control", async ({ page, request }) => {
    await page.goto("/");
    // Pick up the first hashed Next static asset referenced from the home
    // page. CSS link tags are the most reliable since they appear in the
    // initial HTML; <script src> would also work.
    const href = await page
      .locator('link[rel="stylesheet"][href^="/_next/static/"]')
      .first()
      .getAttribute("href");
    expect(href, "expected at least one /_next/static/ stylesheet").toBeTruthy();

    const assetRes = await request.get(href!);
    expect(assetRes.status()).toBe(200);
    const cacheControl = assetRes.headers()["cache-control"] ?? "";
    expect(cacheControl).toMatch(/immutable/);
    expect(cacheControl).toMatch(/max-age=31536000/);
  });
});

test.describe("JSON-LD structured data", () => {
  test("home page emits Organization + WebSite schemas", async ({ page }) => {
    await page.goto("/");
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(scripts.length).toBeGreaterThanOrEqual(2);
    const parsed = scripts.map((s) => JSON.parse(s));
    const types = parsed.map((d) => d["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
    const org = parsed.find((d) => d["@type"] === "Organization");
    expect(org?.name).toBe("Fast Forward");
    expect(org?.url).toBe(APEX);
  });

  test("project page emits BreadcrumbList + CreativeWork schemas", async ({ page }) => {
    const slug = "northeastern-simplifying-online-course-registration";
    await page.goto(`/our-work/${slug}`);
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const parsed = scripts.map((s) => JSON.parse(s));
    const types = parsed.map((d) => d["@type"]);
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("CreativeWork");

    const breadcrumb = parsed.find((d) => d["@type"] === "BreadcrumbList");
    expect(breadcrumb?.itemListElement).toHaveLength(3);
    expect(breadcrumb?.itemListElement[2].item).toBe(
      `${APEX}/our-work/${slug}`,
    );

    const work = parsed.find((d) => d["@type"] === "CreativeWork");
    expect(work?.url).toBe(`${APEX}/our-work/${slug}`);
    expect(work?.name).toMatch(/Simplifying Online Course Registration/);
  });
});
