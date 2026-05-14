import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Pantheon Content Publisher webhook → on-publish revalidation for Lab Project
 * pages. PCC posts here on article.publish / unpublish / update; we
 * invalidate the `pcc:lab-projects` tag (every PCC fetch is tagged with it),
 * so the next request refetches fresh content without a full rebuild.
 *
 * Auth: PCC doesn't send a signing header today, so the shared secret rides
 * in the URL as `?token=...`. Configure the same value as the
 * `PCC_WEBHOOK_SECRET` env var and in PCC's webhook URL.
 */

const LIST_TAG = "pcc:lab-projects";

const HANDLED_EVENTS = new Set([
  "article.publish",
  "article.unpublish",
  "article.update",
]);

export async function POST(req: NextRequest) {
  const secret = process.env.PCC_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "webhook not configured" },
      { status: 503 },
    );
  }

  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!constantTimeEquals(token, secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: { event?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!payload.event || !HANDLED_EVENTS.has(payload.event)) {
    return NextResponse.json({ ignored: true }, { status: 200 });
  }

  revalidateTag(LIST_TAG, "max");

  return new NextResponse(null, { status: 204 });
}

function constantTimeEquals(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length === 0 || aBuf.length !== bBuf.length) return false;
  try {
    return timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}
