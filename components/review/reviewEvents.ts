import type { ReviewEvent } from "@/lib/review-alerts";

/**
 * Browser half of review alerts: POST one event to /api/review-view.
 *
 * Only fires for personal links (`?v=<id>`). A bare `/review/<slug>` is us
 * previewing the page, so it never alerts. `keepalive` lets a contact-click
 * event survive the navigation to mailto:/LinkedIn/Slack.
 */
export function sendReviewEvent(slug: string, event: ReviewEvent): void {
  const v = new URLSearchParams(window.location.search).get("v");
  if (!v) return;
  try {
    void fetch("/api/review-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, v, event }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Alerting must never break the page.
  }
}
