import { NextRequest, NextResponse } from "next/server";
import { classifyInquiry, type InquiryType } from "@/lib/spam-classifier";

/**
 * Contact-form submission → Monday.com Leads board.
 *
 * Pipeline: Cloudflare Turnstile verify → field validation → Claude
 * intent classification → Monday create_item.
 *
 * Turnstile blocks the bot tier; the classifier tags each submission with
 * an inquiry type (business / job / sales_pitch / support / other) so the
 * team can filter the leads board.
 *
 * Env:
 *   MONDAY_API_TOKEN — Monday.com personal API token. Required.
 *   TURNSTILE_SECRET_KEY — Cloudflare Turnstile server-side key. If unset,
 *     verification is skipped with a warning (dev convenience).
 *   ANTHROPIC_API_KEY — Anthropic API key for intent classification.
 *     Optional — when absent, submissions go through untagged.
 *   MONDAY_INQUIRY_TYPE_COLUMN_ID — optional Monday Status column ID. When
 *     set, the inquiry type rides as a status column value. When unset,
 *     it's prepended to the comments long_text column as `[Type: ...]`.
 */

const BOARD_ID = 3979078971;
const GROUP_ID = "new_group99744";
const MONDAY_API_URL = "https://api.monday.com/v2/";
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type Payload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone1?: string;
  phone2?: string;
  phone3?: string;
  company?: string;
  website?: string;
  comments?: string;
  turnstileToken?: string;
};

/** Rough WP `sanitize_text_field` equivalent: strip tags + collapse whitespace/newlines. */
function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function verifyTurnstile(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Dev convenience — local environments without Cloudflare setup still work.
    console.warn(
      "[contact] TURNSTILE_SECRET_KEY not set — skipping Turnstile verification",
    );
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch (err) {
    console.error("[contact] Turnstile verify threw", err);
    return false;
  }
}

function clientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") ?? undefined;
}

export async function POST(request: NextRequest) {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) {
    console.error("MONDAY_API_TOKEN is not set");
    return NextResponse.json(
      { success: false, error: "Server misconfigured" },
      { status: 500 },
    );
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const turnstileOk = await verifyTurnstile(
    body.turnstileToken ?? "",
    clientIp(request),
  );
  if (!turnstileOk) {
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 403 },
    );
  }

  const firstName = sanitize(body.firstName ?? "");
  const lastName = sanitize(body.lastName ?? "");
  const email = sanitize(body.email ?? "");
  const phone = `${body.phone1 ?? ""}${body.phone2 ?? ""}${body.phone3 ?? ""}`.trim();
  const company = sanitize(body.company ?? "");
  const website = sanitize(body.website ?? "");
  const comments = sanitize(body.comments ?? "");

  if (!firstName || !lastName) {
    return NextResponse.json(
      { success: false, error: "Name is required" },
      { status: 400 },
    );
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { success: false, error: "Valid email is required" },
      { status: 400 },
    );
  }
  if (!comments) {
    return NextResponse.json(
      { success: false, error: "Comments are required" },
      { status: 400 },
    );
  }

  // Classifier is contracted to never throw, but wrap defensively so any
  // future bug there can't drop a legitimate lead.
  let inquiryType: InquiryType | null = null;
  try {
    inquiryType = await classifyInquiry({
      firstName,
      lastName,
      email,
      company,
      website,
      comments,
    });
  } catch (err) {
    console.error("[contact] classifier threw unexpectedly", err);
  }

  const inquiryTypeColumnId = process.env.MONDAY_INQUIRY_TYPE_COLUMN_ID;
  const columnValues: Record<string, unknown> = {
    lead_company: company,
    website,
    lead_phone: { phone, countryShortName: "US" },
    lead_email: { email, text: email },
    long_text: { text: commentsForMonday(comments, inquiryType, inquiryTypeColumnId) },
  };
  if (inquiryTypeColumnId && inquiryType) {
    columnValues[inquiryTypeColumnId] = { label: inquiryType };
  }

  const mutation = `mutation CreateItem($board: ID!, $group: String!, $name: String!, $cols: JSON!) {
    create_item(board_id: $board, group_id: $group, item_name: $name, column_values: $cols) {
      id
    }
  }`;

  const variables = {
    board: BOARD_ID,
    group: GROUP_ID,
    name: `${firstName} ${lastName}`,
    cols: JSON.stringify(columnValues),
  };

  try {
    const res = await fetch(MONDAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Version": "2023-10",
        Authorization: token,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });
    const json = (await res.json()) as { errors?: unknown; data?: unknown };
    if (!res.ok || json.errors) {
      console.error("Monday API rejected submission", {
        status: res.status,
        body: json,
      });
      return NextResponse.json(
        { success: false, error: "Upstream failed" },
        { status: 502 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Monday API fetch threw", err);
    return NextResponse.json(
      { success: false, error: "Upstream unreachable" },
      { status: 502 },
    );
  }
}

/**
 * When no Monday status-column ID is configured, prepend the classification
 * to the comments field so it's still visible in the leads board. Otherwise
 * the type rides as a proper column value and the comments stay clean.
 */
function commentsForMonday(
  comments: string,
  inquiryType: InquiryType | null,
  columnId: string | undefined,
): string {
  if (!inquiryType || columnId) return comments;
  return `[Type: ${inquiryType}] ${comments}`;
}
