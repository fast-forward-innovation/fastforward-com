import { expect, test, type Page } from "@playwright/test";

// Prospect reviews: co-branded, unlisted pages at /review/<slug>, opened
// through personal links (?v=<id>). These tests intercept /api/review-view
// — the page's contract with our own API. The route's Slack call is covered
// by tests/unit/api-review-view.test.ts.
//
// Fixture: content/reviews/example-review.mdx (draft, fictional prospect,
// one test recipient `test01ab`).

const REVIEW = "/review/example-review";
const VISITOR = "test01ab";

/** Capture every ping the page sends; respond like the real route. */
async function capturePings(page: Page) {
  const pings: Record<string, unknown>[] = [];
  await page.route("**/api/review-view", async (route) => {
    pings.push(route.request().postDataJSON());
    await route.fulfill({ status: 204 });
  });
  return pings;
}

test.describe("Prospect review page", () => {
  test("renders both brands, the principal's contact block, and is noindex", async ({ page }) => {
    await page.goto(REVIEW);
    await expect(
      page.getByRole("img", { name: "Fast Forward and Northwind Outfitters" }),
    ).toBeVisible();
    await expect(page.locator("h1")).toContainText("Five quick wins");
    await expect(page.getByRole("link", { name: "Email Jason" })).toHaveAttribute(
      "href",
      /^mailto:jason@fastforward\.sh\?subject=Re%3A%20Northwind%20Outfitters%20site%20review$/,
    );
    await expect(page.getByRole("link", { name: "Message on LinkedIn" })).toBeVisible();
    // Live chat is a placeholder that is never online yet.
    await expect(page.getByText(/live chat/i)).toHaveCount(0);
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });

  test("never ships recipient names or IDs in the HTML", async ({ request }) => {
    const html = await (await request.get(REVIEW)).text();
    expect(html).not.toContain("Test Recipient");
    expect(html).not.toContain(VISITOR);
  });

  test("a personal link reports one view per tab session", async ({ page }) => {
    const pings = await capturePings(page);
    await page.goto(`${REVIEW}?v=${VISITOR}`);
    await expect.poll(() => pings.length).toBe(1);
    expect(pings[0]).toEqual({ slug: "example-review", v: VISITOR, event: "view" });

    await page.reload();
    await page.waitForLoadState("networkidle");
    expect(pings).toHaveLength(1);
  });

  test("a bare link (us previewing) never pings", async ({ page }) => {
    const pings = await capturePings(page);
    await page.goto(REVIEW);
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Email Jason" }).click();
    await page.waitForTimeout(300);
    expect(pings).toHaveLength(0);
  });

  test("clicking a contact option reports it", async ({ page }) => {
    const pings = await capturePings(page);
    await page.goto(`${REVIEW}?v=${VISITOR}`);
    await expect.poll(() => pings.length).toBe(1);
    await page.getByRole("link", { name: "Email Jason" }).click();
    await expect.poll(() => pings.length).toBe(2);
    expect(pings[1]).toEqual({ slug: "example-review", v: VISITOR, event: "contact:email" });
  });
});

test.describe("Prospect reviews load no third-party scripts", () => {
  test("Google Analytics is skipped on reviews but kept elsewhere", async ({ page }) => {
    await page.goto(REVIEW);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);

    await page.goto("/");
    await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(1);
  });
});

test.describe("Prospect reviews stay unlisted", () => {
  test("robots.txt disallows /review/", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toMatch(/Disallow: \/review\//);
  });

  test("no review appears in the sitemap or llms.txt", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/review/");
    const llms = await (await request.get("/llms.txt")).text();
    expect(llms).not.toContain("/review/");
  });
});
