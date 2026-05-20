import Anthropic from "@anthropic-ai/sdk";

export type InquiryType =
  | "business"
  | "job"
  | "sales_pitch"
  | "support"
  | "other";

export interface ContactSubmission {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  website: string;
  comments: string;
}

const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You classify contact-form submissions for Fast Forward, a custom software design and development studio.

Choose exactly one category for each submission:
- business: Genuine new-business inquiry. Someone wants Fast Forward to build, design, or consult on a project for them. Includes RFPs, proposal requests, and discovery conversations.
- job: Someone seeking employment, an internship, or contract work AT Fast Forward.
- sales_pitch: Outbound sales/marketing — agencies, dev shops, SEO firms, lead-gen services, recruiters offering candidates, AI tools, or any pitch where the sender is trying to sell Fast Forward something.
- support: Existing client or end-user asking for help with something already shipped (bug reports, account questions, content updates on a current project).
- other: Doesn't fit the above — vague, personal, unclear, or off-topic.

When in doubt between business and sales_pitch, ask: is this person trying to BUY something from Fast Forward (business) or SELL something to Fast Forward (sales_pitch)? "We can offer you our development services" is sales_pitch; "We need help building X" is business.`;

const CLASSIFY_TOOL = {
  name: "classify_inquiry",
  description:
    "Record the classification for this contact-form submission. Always call this exactly once.",
  input_schema: {
    type: "object" as const,
    properties: {
      inquiry_type: {
        type: "string",
        enum: ["business", "job", "sales_pitch", "support", "other"],
        description: "The single category that best fits this submission.",
      },
    },
    required: ["inquiry_type"],
  },
};

function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1) : "";
}

function buildUserMessage(s: ContactSubmission): string {
  // We intentionally pass only the email domain (not the local part) — domain
  // is plenty of signal for "is this a real company" without handing the LLM
  // the user's full identifier.
  const lines = [
    `Name: ${s.firstName} ${s.lastName}`.trim(),
    `Email domain: ${emailDomain(s.email) || "(unknown)"}`,
    s.company ? `Company: ${s.company}` : null,
    s.website ? `Website: ${s.website}` : null,
    "",
    "Comments:",
    s.comments,
  ];
  return lines.filter((l) => l !== null).join("\n");
}

const VALID_TYPES: InquiryType[] = [
  "business",
  "job",
  "sales_pitch",
  "support",
  "other",
];

function isInquiryType(value: unknown): value is InquiryType {
  return (
    typeof value === "string" && (VALID_TYPES as string[]).includes(value)
  );
}

/**
 * Classify a contact-form submission as one of five inquiry types.
 * Returns null on any failure (missing API key, network error, malformed
 * response) — callers must treat null as "skip the tagging" rather than
 * dropping the submission entirely.
 */
export async function classifyInquiry(
  submission: ContactSubmission,
): Promise<InquiryType | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      tools: [CLASSIFY_TOOL],
      tool_choice: { type: "tool", name: CLASSIFY_TOOL.name },
      messages: [{ role: "user", content: buildUserMessage(submission) }],
    });

    for (const block of response.content) {
      if (block.type === "tool_use" && block.name === CLASSIFY_TOOL.name) {
        const input = block.input as { inquiry_type?: unknown };
        if (isInquiryType(input.inquiry_type)) {
          return input.inquiry_type;
        }
      }
    }
    return null;
  } catch (err) {
    console.warn("[spam-classifier] classification failed", err);
    return null;
  }
}
