import { expect, test } from "@playwright/test";

// The webServer fixture sets PCC_WEBHOOK_SECRET=test-pcc-webhook-secret —
// match it exactly here.
const SECRET = "test-pcc-webhook-secret";

test.describe("POST /api/revalidate", () => {
  test("returns 401 with no token", async ({ request }) => {
    const res = await request.post("/api/revalidate", {
      data: { event: "article.publish" },
    });
    expect(res.status()).toBe(401);
  });

  test("returns 401 with wrong token", async ({ request }) => {
    const res = await request.post(
      `/api/revalidate?token=${"x".repeat(SECRET.length)}`,
      { data: { event: "article.publish" } },
    );
    expect(res.status()).toBe(401);
  });

  test("returns 200 (ignored) for unknown events with correct token", async ({ request }) => {
    const res = await request.post(`/api/revalidate?token=${SECRET}`, {
      data: { event: "article.deleted" },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ ignored: true });
  });

  test("returns 204 for handled events with correct token", async ({ request }) => {
    for (const event of [
      "article.publish",
      "article.unpublish",
      "article.update",
    ]) {
      const res = await request.post(`/api/revalidate?token=${SECRET}`, {
        data: { event },
      });
      expect(res.status()).toBe(204);
    }
  });

  // Malformed-JSON behavior is covered by tests/unit/api-revalidate.test.ts.
  // Playwright's request fixture re-encodes string bodies, making it hard to
  // send an actually-malformed payload from e2e — kept in unit-test land.
});
