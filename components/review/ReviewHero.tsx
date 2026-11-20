import Image from "next/image";
import type { Review } from "@/lib/types";
import { hexToRgba } from "@/lib/color";

/**
 * Co-branded header: Fast Forward × the prospect, then the review's title
 * and intro, on a gradient tinted with the prospect's brand color (the same
 * treatment case studies give a client).
 */
export function ReviewHero({ review }: { review: Review }) {
  const { prospect } = review;
  const tint = prospect.brandColor
    ? hexToRgba(prospect.brandColor, 0.17)
    : "#ebf2f6";
  const logo = prospect.logo;

  return (
    <header
      className="review-hero"
      style={{
        background: `linear-gradient(158.44deg, rgba(0, 0, 0, 0.05) 5.69%, ${tint} 63.1%)`,
      }}
    >
      <div className="review-hero__inner">
        <div
          className="review-hero__lockup"
          aria-label={`Fast Forward and ${prospect.name}`}
          role="img"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ff-logo.svg"
            alt=""
            className="review-hero__ff-logo"
            width={112}
            height={73}
          />
          <span className="review-hero__times" aria-hidden>
            ×
          </span>
          {logo?.placeholder ? (
            // Compact stand-in sized to the logo slot. The shared
            // PlaceholderImage prints alt text and notes, which don't fit.
            <span
              className="review-hero__logo-placeholder"
              title={logo.notes || undefined}
            >
              {prospect.name} logo
            </span>
          ) : logo?.src ? (
            <span
              className={prospect.logoBackground ? "review-hero__logo-plate" : undefined}
              style={
                prospect.logoBackground
                  ? { background: prospect.logoBackground }
                  : undefined
              }
            >
              <Image
                src={logo.src}
                alt=""
                width={logo.width ?? 240}
                height={logo.height ?? 80}
                className="review-hero__prospect-logo"
                priority
              />
            </span>
          ) : (
            <span className="review-hero__prospect-name">{prospect.name}</span>
          )}
        </div>
        {review.header?.eyebrow ? (
          <p className="review-hero__eyebrow">{review.header.eyebrow}</p>
        ) : null}
        <h1 className="review-hero__title">{review.title}</h1>
        {review.header?.byline ? (
          <p className="review-hero__byline">{review.header.byline}</p>
        ) : null}
        {review.header?.intro ? (
          <p className="review-hero__intro">{review.header.intro}</p>
        ) : null}
      </div>
    </header>
  );
}
