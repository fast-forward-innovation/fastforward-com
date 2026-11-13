import type { Principal, Review, ReviewRecipient } from "./types";

/**
 * Slack alerts for prospect reviews (`/review/<slug>?v=<id>`).
 *
 * The page is static, so it can't notify on render. Instead `ReviewBeacon`
 * pings `/api/review-view` from the browser — which also keeps email link
 * scanners and Slack/LinkedIn unfurlers (they fetch HTML but run no script)
 * from posting false "they opened it" alerts. This module is the pure half:
 * which events exist, who the visitor is, and what the Slack message says.
 */

export const REVIEW_EVENTS = [
  "view",
  "contact:email",
  "contact:linkedin",
  "contact:chat",
] as const;

export type ReviewEvent = (typeof REVIEW_EVENTS)[number];

export function isReviewEvent(value: unknown): value is ReviewEvent {
  return (REVIEW_EVENTS as readonly unknown[]).includes(value);
}

const EVENT_VERBS: Record<ReviewEvent, string> = {
  view: "opened",
  "contact:email": "clicked *Email* on",
  "contact:linkedin": "clicked *LinkedIn* on",
  "contact:chat": "started a *live chat* on",
};

export function findRecipient(
  review: Review,
  visitorId: string,
): ReviewRecipient | undefined {
  return review.recipients?.find((r) => r.id === visitorId);
}

/** Slack mrkdwn treats &, <, > as control characters. */
function escapeSlack(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface AlertInput {
  review: Review;
  principal?: Principal;
  /** The `v` value from the personal link. */
  visitorId: string;
  event: ReviewEvent;
  /** `PANTHEON_ENVIRONMENT` — anything but `live` prefixes the message. */
  environment?: string;
  siteUrl: string;
}

/** Slack incoming-webhook payload for one review event. */
export function buildReviewAlert(input: AlertInput): { text: string } {
  const { review, principal, visitorId, event, environment, siteUrl } = input;
  const recipient = findRecipient(review, visitorId);

  const who = recipient
    ? `*${escapeSlack(recipient.name)}*${recipient.title ? ` (${escapeSlack(recipient.title)})` : ""}`
    : `Unrecognised visitor ID \`${escapeSlack(visitorId)}\``;
  const emoji = event === "view" ? "👀" : "💬";
  const url = `${siteUrl.replace(/\/$/, "")}/review/${review.slug}`;
  const mention = principal?.slackUserId ? ` · <@${principal.slackUserId}>` : "";
  const env =
    environment && environment !== "live" ? `[${escapeSlack(environment)}] ` : "";

  return {
    text: `${env}${emoji} ${who} ${EVENT_VERBS[event]} <${url}|${escapeSlack(review.title)}> (${escapeSlack(review.prospect.name)})${mention}`,
  };
}

/**
 * Best-effort, per-container throttle: one alert per key per window. It
 * stops a refresh-happy visitor from flooding the channel; it is not a
 * guarantee across containers, which is fine for a notification.
 */
export class AlertThrottle {
  private last = new Map<string, number>();
  constructor(private windowMs: number) {}

  /** True if this key may alert now (and records it). */
  allow(key: string, now = Date.now()): boolean {
    const prev = this.last.get(key);
    if (prev !== undefined && now - prev < this.windowMs) return false;
    this.last.set(key, now);
    if (this.last.size > 5000) {
      for (const [k, t] of this.last) {
        if (now - t >= this.windowMs) this.last.delete(k);
      }
    }
    return true;
  }
}
