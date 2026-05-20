import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/revalidate/route";

const SECRET = "real-test-secret-with-sufficient-length";

function buildRequest(token: string | null, body: unknown): Request {
  const url = token === null
    ? "https://fastforward.sh/api/revalidate"
    : `https://fastforward.sh/api/revalidate?token=${encodeURIComponent(token)}`;
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.stubEnv("PCC_WEBHOOK_SECRET", SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/revalidate", () => {
  it("returns 503 when PCC_WEBHOOK_SECRET is not configured", async () => {
    vi.stubEnv("PCC_WEBHOOK_SECRET", "");
    const res = await POST(
      buildRequest(SECRET, { event: "article.publish" }) as never,
    );
    expect(res.status).toBe(503);
  });

  it("returns 401 when token is missing", async () => {
    const res = await POST(
      buildRequest(null, { event: "article.publish" }) as never,
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 when token is empty string", async () => {
    const res = await POST(
      buildRequest("", { event: "article.publish" }) as never,
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 when token is wrong", async () => {
    const res = await POST(
      buildRequest("definitely-not-the-secret", {
        event: "article.publish",
      }) as never,
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 when token is the same length but mismatched", async () => {
    const wrong = "x".repeat(SECRET.length);
    expect(wrong.length).toBe(SECRET.length);
    const res = await POST(
      buildRequest(wrong, { event: "article.publish" }) as never,
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await POST(buildRequest(SECRET, "{not-json") as never);
    expect(res.status).toBe(400);
  });

  it("returns 200 (ignored) for unknown event names", async () => {
    const res = await POST(
      buildRequest(SECRET, { event: "article.deleted" }) as never,
    );
    expect(res.status).toBe(200);
    expect((await res.json()).ignored).toBe(true);
  });

  it("returns 204 for handled events with the correct secret", async () => {
    for (const event of [
      "article.publish",
      "article.unpublish",
      "article.update",
    ]) {
      const res = await POST(buildRequest(SECRET, { event }) as never);
      expect(res.status).toBe(204);
    }
  });
});
