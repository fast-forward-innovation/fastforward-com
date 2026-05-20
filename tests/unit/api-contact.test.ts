import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/contact/route";

const VALID_PAYLOAD = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone1: "617",
  phone2: "555",
  phone3: "0000",
  company: "Analytical Engines",
  website: "https://analyticalengines.example",
  comments: "Interested in a project — please reach out.",
};

function buildRequest(body: unknown): Request {
  return new Request("https://fastforward.sh/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function stubMondayFetch(response: {
  ok?: boolean;
  status?: number;
  body?: unknown;
}) {
  const captured: { url?: string; body?: unknown; headers?: HeadersInit } = {};
  const fetchMock = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
    captured.url = typeof input === "string" ? input : (input as Request).url;
    captured.body = init?.body
      ? JSON.parse(init.body as string)
      : undefined;
    captured.headers = init?.headers;
    return new Response(JSON.stringify(response.body ?? { data: {} }), {
      status: response.status ?? (response.ok === false ? 500 : 200),
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, captured };
}

beforeEach(() => {
  vi.stubEnv("MONDAY_API_TOKEN", "test-token");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/contact", () => {
  it("returns 500 when MONDAY_API_TOKEN is not configured", async () => {
    vi.stubEnv("MONDAY_API_TOKEN", "");
    const res = await POST(buildRequest(VALID_PAYLOAD) as never);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await POST(buildRequest("{not-json") as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 when firstName or lastName is missing", async () => {
    const res = await POST(
      buildRequest({ ...VALID_PAYLOAD, firstName: "" }) as never,
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/name/i);
  });

  it("returns 400 when email is missing or invalid", async () => {
    const res = await POST(
      buildRequest({ ...VALID_PAYLOAD, email: "not-an-email" }) as never,
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/email/i);
  });

  it("returns 400 when comments is empty", async () => {
    const res = await POST(
      buildRequest({ ...VALID_PAYLOAD, comments: "" }) as never,
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/comments/i);
  });

  it("sends a GraphQL mutation to Monday and returns success", async () => {
    const { fetchMock, captured } = stubMondayFetch({
      body: { data: { create_item: { id: "1" } } },
    });
    const res = await POST(buildRequest(VALID_PAYLOAD) as never);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(captured.url).toBe("https://api.monday.com/v2/");
    const sent = captured.body as { query?: string; variables?: { name?: string; cols?: string } };
    expect(sent.query).toContain("create_item");
    expect(sent.variables?.name).toBe("Ada Lovelace");
    const cols = JSON.parse(sent.variables?.cols ?? "{}");
    expect(cols.lead_email.email).toBe("ada@example.com");
    expect(cols.lead_phone.phone).toBe("6175550000");
  });

  it("returns 502 when Monday returns GraphQL errors", async () => {
    stubMondayFetch({
      body: { errors: [{ message: "Bad column" }] },
    });
    const res = await POST(buildRequest(VALID_PAYLOAD) as never);
    expect(res.status).toBe(502);
  });

  it("returns 502 when the Monday fetch throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const res = await POST(buildRequest(VALID_PAYLOAD) as never);
    expect(res.status).toBe(502);
  });

  it("strips HTML tags from text fields before sending to Monday", async () => {
    const { captured } = stubMondayFetch({
      body: { data: { create_item: { id: "1" } } },
    });
    await POST(
      buildRequest({
        ...VALID_PAYLOAD,
        comments: "Hello <script>alert('xss')</script> world",
      }) as never,
    );
    const sent = captured.body as { variables: { cols: string } };
    const cols = JSON.parse(sent.variables.cols);
    expect(cols.long_text.text).not.toContain("<script>");
    expect(cols.long_text.text).toContain("Hello");
  });
});
