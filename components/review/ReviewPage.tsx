import type { Principal, Review } from "@/lib/types";
import { ReviewSections } from "./ReviewSections";
import { ReviewHero } from "./ReviewHero";
import { ReviewContact } from "./ReviewContact";
import { ReviewBeacon } from "./ReviewBeacon";

/**
 * A co-branded prospect site review. Takes the review and its principal
 * only — the recipient list stays server-side (it's read by the alert
 * route, never rendered or passed to a client component).
 */
export function ReviewPage({
  review,
  principal,
}: {
  review: Review;
  principal: Principal;
}) {
  return (
    <article className="review">
      <ReviewHero review={review} />
      <ReviewSections sections={review.pageSections ?? []} />
      <ReviewContact review={review} principal={principal} />
      {review.footnote ? (
        <div className="review-block">
          <p className="review-block__inner review-footnote">{review.footnote}</p>
        </div>
      ) : null}
      <ReviewBeacon slug={review.slug} />
    </article>
  );
}
