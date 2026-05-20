import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockClassify } = vi.hoisted(() => ({ mockClassify: vi.fn() }));

vi.mock("@/lib/spam-classifier", () => ({
  classifyInquiry: mockClassify,
}));

// Import after vi.mock so the route picks up the mocked classifier.
const { POST } = await import("@/app/api/contact/route");

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
  turnstileToken: "test-turnstile-token",
};

function buildRequest(body: unknown): Request {
  return new Request("https://fastforward.sh/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

/**
 * Routes fetch calls to Cloudflare's Turnstile verify endpoint and to
 * Monday's GraphQL endpoint to caller-supplied responders. Returns the
 * captured request bodies so tests can assert on payload shape.
 */
function stubRoutedFetch(opts: {
  turnstile?: { success: boolean };
  monday?: { ok?: boolean; status?: number; body?: unknown };
  mondayThrows?: boolean;
}) {
  const captured: {
    turnstileBody?: URLSearchParams;
    mondayBody?: unknown;
  } = {};
  const fetchMock = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
    const url = typeof input === "string" ? input : (input as Request).url;
    if (url.includes("challenges.cloudflare.com")) {
      captured.turnstileBody = new URLSearchParams(init?.body as string);
      return new Response(
        JSON.stringify({ success: opts.turnstile?.success ?? true }),
        { status: 200 },
      );
    }
    if (url.includes("api.monday.com")) {
      captured.mondayBody = init?.body ? JSON.parse(init.body as string) : undefined;
      if (opts.mondayThrows) throw new Error("network down");
      return new Response(JSON.stringify(opts.monday?.body ?? { data: {} }), {
        status: opts.monday?.status ?? (opts.monday?.ok === false ? 500 : 200),
      });
    }
    throw new Error(`Unexpected fetch URL: ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, captured };
}

beforeEach(() => {
  vi.stubEnv("MONDAY_API_TOKEN", "test-token");
  // Default: classifier returns null (no tagging). Individual tests override.
  mockClassify.mockReset();
  mockClassify.mockResolvedValue(null);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/contact — field validation", () => {
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
});

describe("POST /api/contact — Monday submission", () => {
  it("sends a GraphQL mutation to Monday and returns success", async () => {
    const { fetchMock, captured } = stubRoutedFetch({
      monday: { body: { data: { create_item: { id: "1" } } } },
    });
    const res = await POST(buildRequest(VALID_PAYLOAD) as never);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const sent = captured.mondayBody as {
      query?: string;
      variables?: { name?: string; cols?: string };
    };
    expect(sent.query).toContain("create_item");
    expect(sent.variables?.name).toBe("Ada Lovelace");
    const cols = JSON.parse(sent.variables?.cols ?? "{}");
    expect(cols.lead_email.email).toBe("ada@example.com");
    expect(cols.lead_phone.phone).toBe("6175550000");
  });

  it("returns 502 when Monday returns GraphQL errors", async () => {
    stubRoutedFetch({ monday: { body: { errors: [{ message: "Bad" }] } } });
    const res = await POST(buildRequest(VALID_PAYLOAD) as never);
    expect(res.status).toBe(502);
  });

  it("returns 502 when the Monday fetch throws", async () => {
    stubRoutedFetch({ mondayThrows: true });
    const res = await POST(buildRequest(VALID_PAYLOAD) as never);
    expect(res.status).toBe(502);
  });

  it("strips HTML tags from text fields before sending to Monday", async () => {
    const { captured } = stubRoutedFetch({
      monday: { body: { data: { create_item: { id: "1" } } } },
    });
    await POST(
      buildRequest({
        ...VALID_PAYLOAD,
        comments: "Hello <script>alert('xss')</script> world",
      }) as never,
    );
    const sent = captured.mondayBody as { variables: { cols: string } };
    const cols = JSON.parse(sent.variables.cols);
    expect(cols.long_text.text).not.toContain("<script>");
    expect(cols.long_text.text).toContain("Hello");
  });
});

describe("POST /api/contact — Turnstile verification", () => {
  beforeEach(() => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
  });

  it("returns 403 when the Turnstile token is missing", async () => {
    const { fetchMock } = stubRoutedFetch({
      turnstile: { success: true },
      monday: { body: { data: {} } },
    });
    const { turnstileToken: _, ...withoutToken } = VALID_PAYLOAD;
    void _;
    const res = await POST(buildRequest(withoutToken) as never);
    expect(res.status).toBe(403);
    // No upstream calls should have happened
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 403 when Turnstile verify returns success=false", async () => {
    const { fetchMock } = stubRoutedFetch({
      turnstile: { success: false },
      monday: { body: { data: {} } },
    });
    const res = await POST(buildRequest(VALID_PAYLOAD) as never);
    expect(res.status).toBe(403);
    // Turnstile was called; Monday must NOT have been
    const mondayCalls = fetchMock.mock.calls.filter(
      ([url]) => typeof url === "string" && url.includes("api.monday.com"),
    );
    expect(mondayCalls).toHaveLength(0);
  });

  it("proceeds to Monday when Turnstile verify returns success=true", async () => {
    const { fetchMock, captured } = stubRoutedFetch({
      turnstile: { success: true },
      monday: { body: { data: { create_item: { id: "1" } } } },
    });
    const res = await POST(buildRequest(VALID_PAYLOAD) as never);
    expect(res.status).toBe(200);
    // Both endpoints were called
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(captured.turnstileBody?.get("secret")).toBe("test-secret");
    expect(captured.turnstileBody?.get("response")).toBe("test-turnstile-token");
  });

  it("skips verification when TURNSTILE_SECRET_KEY is unset (dev parity)", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const { fetchMock } = stubRoutedFetch({
      monday: { body: { data: { create_item: { id: "1" } } } },
    });
    const res = await POST(buildRequest(VALID_PAYLOAD) as never);
    expect(res.status).toBe(200);
    // Only Monday was called; no Cloudflare verify
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/contact — classifier integration", () => {
  it("prepends [Type: ...] to comments when classifier returns a type and no column ID is set", async () => {
    mockClassify.mockResolvedValueOnce("sales_pitch");
    const { captured } = stubRoutedFetch({
      monday: { body: { data: { create_item: { id: "1" } } } },
    });
    await POST(buildRequest(VALID_PAYLOAD) as never);
    const sent = captured.mondayBody as { variables: { cols: string } };
    const cols = JSON.parse(sent.variables.cols);
    expect(cols.long_text.text).toMatch(/^\[Type: sales_pitch\]/);
  });

  it("writes the type as a Monday Dropdown column value when MONDAY_INQUIRY_TYPE_COLUMN_ID is set", async () => {
    vi.stubEnv("MONDAY_INQUIRY_TYPE_COLUMN_ID", "inquiry_type__1");
    mockClassify.mockResolvedValueOnce("job");
    const { captured } = stubRoutedFetch({
      monday: { body: { data: { create_item: { id: "1" } } } },
    });
    await POST(buildRequest(VALID_PAYLOAD) as never);
    const sent = captured.mondayBody as { variables: { cols: string } };
    const cols = JSON.parse(sent.variables.cols);
    // Dropdown column wants { labels: ["..."] } (plural, array) —
    // Status would be { label: "..." }, which Monday rejects against a
    // Dropdown column with a 200 + GraphQL errors payload.
    expect(cols.inquiry_type__1).toEqual({ labels: ["job"] });
    // Comments should NOT carry the [Type:] prefix when the column is used
    expect(cols.long_text.text).not.toMatch(/^\[Type:/);
  });

  it("submission succeeds untagged when the classifier returns null", async () => {
    mockClassify.mockResolvedValueOnce(null);
    const { captured } = stubRoutedFetch({
      monday: { body: { data: { create_item: { id: "1" } } } },
    });
    const res = await POST(buildRequest(VALID_PAYLOAD) as never);
    expect(res.status).toBe(200);
    const sent = captured.mondayBody as { variables: { cols: string } };
    const cols = JSON.parse(sent.variables.cols);
    expect(cols.long_text.text).not.toMatch(/^\[Type:/);
  });

  it("submission succeeds untagged when the classifier throws", async () => {
    mockClassify.mockRejectedValueOnce(new Error("classifier explode"));
    const { captured } = stubRoutedFetch({
      monday: { body: { data: { create_item: { id: "1" } } } },
    });
    // The classifier should never throw upward (it catches internally), but
    // even if a future refactor lets one through, the submission must still
    // reach Monday.
    let res: Response | null = null;
    try {
      res = await POST(buildRequest(VALID_PAYLOAD) as never);
    } catch {
      // If the route accidentally re-throws we'll fail on the assertion below
    }
    expect(res?.status).toBe(200);
    const sent = captured.mondayBody as { variables: { cols: string } } | undefined;
    expect(sent).toBeDefined();
  });
});
