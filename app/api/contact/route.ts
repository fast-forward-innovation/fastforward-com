import { NextRequest, NextResponse } from "next/server";

/**
 * Contact-form submission → Monday.com Leads board.
 *
 * Replaces the WP REST route /wp-json/ff-website-contacts/v1/submit that
 * previously handled this. Spec extracted from
 * fastforward-web/reference/ff-website-contacts.php.
 *
 * Env:
 *   MONDAY_API_TOKEN — personal API token. Store only in Pantheon Secrets
 *   Manager (production) or .env.local (local dev, auto-gitignored).
 *   Rotate the pre-existing token before launch — see Phase 5/7 in plan.
 */

const BOARD_ID = 3979078971;
const GROUP_ID = "new_group99744";
const MONDAY_API_URL = "https://api.monday.com/v2/";

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
};

/** Rough WP `sanitize_text_field` equivalent: strip tags + collapse whitespace/newlines. */
function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

  const columnValues = {
    lead_company: company,
    website,
    lead_phone: { phone, countryShortName: "US" },
    lead_email: { email, text: email },
    long_text: { text: comments },
  };

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
