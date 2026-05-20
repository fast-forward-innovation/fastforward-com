import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  classifyInquiry,
  type ContactSubmission,
  type InquiryType,
} from "@/lib/spam-classifier";

const SAMPLE: ContactSubmission = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  website: "https://analyticalengines.example",
  comments: "We're looking to hire a team for a new product build.",
};

const { mockCreate, MockAnthropic } = vi.hoisted(() => {
  const mockCreate = vi.fn();
  // Must be a regular function (not arrow) so vi.fn supports `new` invocation.
  const MockAnthropic = vi.fn(function (this: { messages: { create: typeof mockCreate } }) {
    this.messages = { create: mockCreate };
  });
  return { mockCreate, MockAnthropic };
});

vi.mock("@anthropic-ai/sdk", () => ({
  __esModule: true,
  default: MockAnthropic,
  Anthropic: MockAnthropic,
}));

function toolUseResponse(toolInput: unknown) {
  return {
    content: [
      {
        type: "tool_use",
        name: "classify_inquiry",
        input: toolInput,
      },
    ],
  };
}

beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  mockCreate.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("classifyInquiry", () => {
  it("returns null when ANTHROPIC_API_KEY is missing (no SDK call)", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    mockCreate.mockResolvedValueOnce(toolUseResponse({ inquiry_type: "business" }));
    const result = await classifyInquiry(SAMPLE);
    expect(result).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it.each<InquiryType>([
    "business",
    "job",
    "sales_pitch",
    "support",
    "other",
  ])("returns %s when the tool input says so", async (type) => {
    mockCreate.mockResolvedValueOnce(toolUseResponse({ inquiry_type: type }));
    expect(await classifyInquiry(SAMPLE)).toBe(type);
  });

  it("returns null when the tool input has an unexpected value", async () => {
    mockCreate.mockResolvedValueOnce(
      toolUseResponse({ inquiry_type: "definitely-not-a-real-category" }),
    );
    expect(await classifyInquiry(SAMPLE)).toBeNull();
  });

  it("returns null when the SDK throws", async () => {
    mockCreate.mockRejectedValueOnce(new Error("network down"));
    expect(await classifyInquiry(SAMPLE)).toBeNull();
  });

  it("sends only the email domain in the user message (no local part)", async () => {
    mockCreate.mockResolvedValueOnce(toolUseResponse({ inquiry_type: "business" }));
    await classifyInquiry(SAMPLE);
    const call = mockCreate.mock.calls[0][0] as {
      messages: { content: string }[];
    };
    const userContent = call.messages[0].content;
    expect(userContent).toContain("example.com");
    expect(userContent).not.toContain("ada@");
  });

  it("forces the classify_inquiry tool and uses the Haiku model", async () => {
    mockCreate.mockResolvedValueOnce(toolUseResponse({ inquiry_type: "business" }));
    await classifyInquiry(SAMPLE);
    const call = mockCreate.mock.calls[0][0] as {
      tool_choice: { type: string; name: string };
      model: string;
    };
    expect(call.tool_choice).toEqual({
      type: "tool",
      name: "classify_inquiry",
    });
    expect(call.model).toMatch(/^claude-haiku-/);
  });
});
