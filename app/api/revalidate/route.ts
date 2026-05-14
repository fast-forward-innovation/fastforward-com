import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Pantheon Content Publisher webhook → on-publish revalidation for Lab Project
 * pages. PCC posts here on article.published / unpublished / updated; we
 * invalidate the cached list + the specific slug so the next request refetches
 * fresh PCC content without a full rebuild.
 *
 * Env:
 *   PCC_WEBHOOK_SECRET — shared secret. Same value goes into the PCC
 *   webhook config. Generate with `openssl rand -hex 32`.
 */

const LIST_TAG = "pcc:lab-projects";
const detailTag = (slug: string) => `pcc:lab-project:${slug}`;

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

  const raw = await req.text();
  const signature = req.headers.get("x-pantheon-signature") ?? "";
  if (!verifySignature(raw, signature, secret)) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  let payload: { slug?: string; event?: string };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { slug, event } = payload;
  if (!event || !HANDLED_EVENTS.has(event)) {
    return NextResponse.json({ ignored: true }, { status: 200 });
  }

  revalidateTag(LIST_TAG, "max");
  if (slug) revalidateTag(detailTag(slug), "max");

  return new NextResponse(null, { status: 204 });
}

function verifySignature(body: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(
    signature.replace(/^sha256=/, "").trim(),
    "hex",
  );
  if (a.length === 0 || a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
