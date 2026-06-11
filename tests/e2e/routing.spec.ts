import { expect, test } from "@playwright/test";

test.describe("Static routes render", () => {
  test("home page renders without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("/our-work index renders and links to a project", async ({ page }) => {
    await page.goto("/our-work");
    await expect(page.locator("body")).toBeVisible();
    // At least one project card links to /our-work/<slug>.
    const projectLinks = page.locator(
      'a[href^="/our-work/"]:not([href="/our-work"])',
    );
    expect(await projectLinks.count()).toBeGreaterThan(0);
  });

  test("/contact-us renders the contact form", async ({ page }) => {
    await page.goto("/contact-us");
    await expect(page.locator("#contact-form")).toBeVisible();
    await expect(page.locator("#firstName")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
  });

  for (const path of [
    "/accessibility",
    "/privacy-policy",
    "/museum-experiences",
    "/mit-haiti-pantheon-migration",
  ]) {
    test(`static page ${path} renders`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Project case studies render", () => {
  test("architecture-and-release-workflow renders header content", async ({ page }) => {
    await page.goto("/our-work/architecture-and-release-workflow");
    await expect(
      page.getByRole("heading", { name: /Architecture and Release Workflow/i }),
    ).toBeVisible();
  });

  test("real-time-advice-for-expectant-parents renders", async ({ page }) => {
    const response = await page.goto("/our-work/real-time-advice-for-expectant-parents");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("404 handling", () => {
  test("/our-work/<unknown-slug> returns 404", async ({ page }) => {
    const response = await page.goto("/our-work/does-not-exist-anywhere");
    expect(response?.status()).toBe(404);
  });

  test("/<unknown-slug> returns 404", async ({ page }) => {
    const response = await page.goto("/no-such-page-here");
    expect(response?.status()).toBe(404);
  });
});
