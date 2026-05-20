import { expect, test } from "@playwright/test";

// E2E tests intercept /api/contact rather than Monday.com directly — the
// frontend's contract with our own API is what we want to lock down here.
// The server route's Monday integration is covered by the unit test in
// tests/unit/api-contact.test.ts.

async function fillValidForm(page: import("@playwright/test").Page) {
  await page.fill("#firstName", "Ada");
  await page.fill("#lastName", "Lovelace");
  await page.fill("#email", "ada@example.com");
  await page.fill("#phone1", "617");
  await page.fill("#phone2", "555");
  await page.fill("#phone3", "0000");
  await page.fill("#company", "Analytical Engines");
  await page.fill("#comments", "Interested in working together.");
}

test.describe("Contact form", () => {
  test("submits a valid payload and redirects on success", async ({ page }) => {
    let captured: Record<string, unknown> | undefined;
    await page.route("**/api/contact", async (route) => {
      try {
        captured = await route.request().postDataJSON();
      } catch {
        captured = undefined;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/contact-us");
    await fillValidForm(page);
    await page.getByRole("button", { name: /Contact Us/i }).click();
    await page.waitForURL(/\/contact-submitted\?success=true/);

    expect(captured).toBeTruthy();
    expect(captured?.firstName).toBe("Ada");
    expect(captured?.lastName).toBe("Lovelace");
    expect(captured?.email).toBe("ada@example.com");
    expect(captured?.comments).toMatch(/working together/);
  });

  test("redirects with ?success=false when /api/contact responds non-2xx", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Upstream failed" }),
      });
    });

    await page.goto("/contact-us");
    await fillValidForm(page);
    await page.getByRole("button", { name: /Contact Us/i }).click();
    await page.waitForURL(/\/contact-submitted\?success=false/);
  });

  test("does not submit and surfaces validation errors when form is empty", async ({ page }) => {
    let calls = 0;
    await page.route("**/api/contact", async (route) => {
      calls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/contact-us");
    await page.getByRole("button", { name: /Contact Us/i }).click();

    // Validation banner appears and we don't navigate away.
    await expect(
      page.getByText("Please correct the highlighted fields above before submitting."),
    ).toBeVisible();
    expect(page.url()).toContain("/contact-us");
    expect(calls).toBe(0);
  });
});
