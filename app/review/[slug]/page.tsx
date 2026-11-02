import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllReviews, getPrincipal, getReviewBySlug } from "@/lib/content";
import { ReviewPage } from "@/components/review/ReviewPage";
import { DraftStatusToast } from "@/components/DraftStatusToast";

// Reviews are prerendered: every recipient gets the same static HTML, and
// the personal `?v=` ID is read in the browser by ReviewBeacon. A review
// added after a build 404s until the next one.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllReviews().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const review = getReviewBySlug(slug);
  if (!review) return {};
  return {
    // `metaTitle` is used verbatim; otherwise the root layout's
    // "%s — Fast Forward" template applies.
    title: review.metaTitle
      ? { absolute: review.metaTitle }
      : `${review.title} · ${review.prospect.name}`,
    description: review.header?.intro,
    // Unlisted by design — reachable only through the links we send.
    robots: { index: false, follow: false },
    // Keep the personal ?v= link out of any Referer sent to the sites
    // this page links to.
    referrer: "strict-origin-when-cross-origin",
  };
}

export default async function ReviewRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const review = getReviewBySlug(slug);
  if (!review) notFound();
  // validateReview() guarantees the principal exists at load time.
  const principal = getPrincipal(review.principal)!;

  return (
    <>
      <ReviewPage review={review} principal={principal} />
      {review.draft && (
        <DraftStatusToast
          slug={`review/${review.slug}`}
          editorial={review.editorial ?? { status: "draft" }}
        />
      )}
    </>
  );
}
