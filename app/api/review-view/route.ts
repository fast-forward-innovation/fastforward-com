import { NextResponse } from "next/server";
import { getPrincipal, getReviewBySlug } from "@/lib/content";
import {
  AlertThrottle,
  buildReviewAlert,
  isReviewEvent,
} from "@/lib/review-alerts";

/**
 * Prospect-review activity → Slack.
 *
 * `ReviewBeacon` POSTs `{ slug, v, event }` from the browser when someone
 * opens a review through their personal link, and again when they click a
 * contact option. This route resolves the visitor against the review's
 * recipients and posts one line to the alerts channel, @-mentioning the
 * review's principal.
 *
 * Always answers 204 for a well-formed request — whether or not Slack is
 * configured or reachable — so nothing about alerting ever surfaces on the
 * page.
 *
 * Env:
 *   SLACK_REVIEW_WEBHOOK_URL — Slack incoming-webhook URL for the alerts
 *     channel. Set it on Live only; when unset (local, dev, multidevs) the
 *     event is logged instead, so previewing a review doesn't alert anyone.
 *   PANTHEON_ENVIRONMENT — non-Live environments prefix the message
 *     (e.g. `[test]`) if a webhook is configured there.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fastforward.sh";

/** One alert per visitor, review and event per 30 minutes. */
const throttle = new AlertThrottle(30 * 60 * 1000);

/** Loose shape check: unknown-but-plausible IDs are still reported. */
const VISITOR_ID = /^[A-Za-z0-9_-]{1,64}$/;

export async function POST(req: Request) {
  let body: { slug?: unknown; v?: unknown; event?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { slug, v, event } = body;
  if (
    typeof slug !== "string" ||
    typeof v !== "string" ||
    !VISITOR_ID.test(v) ||
    !isReviewEvent(event)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const review = getReviewBySlug(slug);
  if (!review) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!throttle.allow(`${slug}:${v}:${event}`)) {
    return new NextResponse(null, { status: 204 });
  }

  const alert = buildReviewAlert({
    review,
    principal: getPrincipal(review.principal),
    visitorId: v,
    event,
    environment: process.env.PANTHEON_ENVIRONMENT,
    siteUrl: SITE_URL,
  });

  const webhook = process.env.SLACK_REVIEW_WEBHOOK_URL;
  if (!webhook) {
    console.info(`[review-view] SLACK_REVIEW_WEBHOOK_URL not set — ${alert.text}`);
    return new NextResponse(null, { status: 204 });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(alert),
    });
    if (!res.ok) {
      console.error(`[review-view] Slack responded ${res.status}`);
    }
  } catch (err) {
    console.error("[review-view] Slack request failed", err);
  }

  return new NextResponse(null, { status: 204 });
}
