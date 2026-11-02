"use client";

import { useEffect } from "react";
import { sendReviewEvent } from "./reviewEvents";

/**
 * Renders nothing. Reports one "view" per browser-tab session when a review
 * is opened through a personal link. Running in the browser (rather than on
 * render) is what keeps link scanners and unfurlers from counting as views.
 */
export function ReviewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `ff-review-viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked (private mode): fall through and report anyway.
    }
    sendReviewEvent(slug, "view");
  }, [slug]);

  return null;
}
