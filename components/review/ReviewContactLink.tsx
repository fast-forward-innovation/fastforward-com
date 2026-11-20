"use client";

import type { ReactNode } from "react";
import type { ReviewEvent } from "@/lib/review-alerts";
import { sendReviewEvent } from "./reviewEvents";

/** A contact option that also tells the principal (via Slack) it was used. */
export function ReviewContactLink({
  slug,
  event,
  href,
  className,
  children,
  external = false,
}: {
  slug: string;
  event: ReviewEvent;
  href: string;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => sendReviewEvent(slug, event)}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
