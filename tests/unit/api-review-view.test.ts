import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Principal, Review } from "@/lib/types";

const REVIEW: Review = {
  title: "Five quick wins for acme.example",
  slug: "acme",
  date: "2026-11-02T12:00:00",
  principal: "jason",
  prospect: { name: "Acme" },
  recipients: [{ id: "k7f2q9mx", name: "Jane Doe", title: "VP Marketing" }],
};
const PRINCIPAL: Principal = {
  id: "jason",
  name: "Jason Yarrington",
  email: "jason@fastforward.sh",
  slackUserId: "U0123ABC",
};

vi.mock("@/lib/content", () => ({
  getReviewBySlug: (slug: string) => (slug === "acme" ? REVIEW : null),
  getPrincipal: (id: string) => (id === "jason" ? PRINCIPAL : undefined),
}));

const WEBHOOK = "https://hooks.slack.com/services/T000/B000/XXXX";

// The route keeps throttle state at module scope; load a fresh copy per test.
async function loadRoute() {
  vi.resetModules();
  return (await import("@/app/api/review-view/route")).POST;
}

function request(body: unknown): Request {
  return new Request("https://fastforward.sh/api/review-view", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function stubSlack(status = 200) {
  const fetchMock = vi.fn(async () => new Response("ok", { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.stubEnv("SLACK_REVIEW_WEBHOOK_URL", WEBHOOK);
  vi.stubEnv("PANTHEON_ENVIRONMENT", "live");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fastforward.sh");
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/review-view", () => {
  it("posts the alert to Slack and answers 204", async () => {
    const fetchMock = stubSlack();
    const POST = await loadRoute();
    const res = await POST(request({ slug: "acme", v: "k7f2q9mx", event: "view" }));
    expect(res.status).toBe(204);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(WEBHOOK);
    const { text } = JSON.parse(init.body as string);
    expect(text).toContain("*Jane Doe* (VP Marketing) opened");
    expect(text).toContain("<@U0123ABC>");
  });

  it("throttles a repeat of the same visitor + event", async () => {
    const fetchMock = stubSlack();
    const POST = await loadRoute();
    const body = { slug: "acme", v: "k7f2q9mx", event: "view" };
    await POST(request(body));
    const second = await POST(request(body));
    expect(second.status).toBe(204);
    expect(fetchMock).toHaveBeenCalledOnce();
    // A different event from the same visitor still alerts.
    await POST(request({ ...body, event: "contact:email" }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("logs instead of posting when the webhook is unset", async () => {
    vi.stubEnv("SLACK_REVIEW_WEBHOOK_URL", "");
    const fetchMock = stubSlack();
    const POST = await loadRoute();
    const res = await POST(request({ slug: "acme", v: "k7f2q9mx", event: "view" }));
    expect(res.status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining("Jane Doe"));
  });

  it("still answers 204 when Slack fails", async () => {
    stubSlack(500);
    const POST = await loadRoute();
    const res = await POST(request({ slug: "acme", v: "k7f2q9mx", event: "view" }));
    expect(res.status).toBe(204);
    expect(console.error).toHaveBeenCalled();
  });

  it("404s an unknown review", async () => {
    const fetchMock = stubSlack();
    const POST = await loadRoute();
    const res = await POST(request({ slug: "nope", v: "k7f2q9mx", event: "view" }));
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("400s bad JSON, unknown events, and malformed visitor IDs", async () => {
    stubSlack();
    const POST = await loadRoute();
    expect((await POST(request("{not json"))).status).toBe(400);
    expect((await POST(request({ slug: "acme", v: "k7f2q9mx", event: "contact:fax" }))).status).toBe(400);
    expect((await POST(request({ slug: "acme", v: "has space", event: "view" }))).status).toBe(400);
    expect((await POST(request({ slug: "acme", event: "view" }))).status).toBe(400);
  });
});
