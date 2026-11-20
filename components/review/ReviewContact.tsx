import Image from "next/image";
import type { Principal, Review } from "@/lib/types";
import { DefaultAvatar } from "../postBlocks/DefaultAvatar";
import { ReviewContactLink } from "./ReviewContactLink";
import { LiveChatButton } from "./LiveChatButton";

const PRIMARY =
  "btn inline-block linear-gradient-background-hover text-white text-center";
const SECONDARY = "btn inline-block review-contact__secondary text-center";

/**
 * Every way to reach the principal who sent the review. The heading and lead
 * default to a generic invitation; a review can override both (`contact:` in
 * frontmatter) so a brief's closing section becomes this block. Options with
 * no value in content/principals.yml are hidden; live chat appears only while
 * someone is online (see lib/chat.ts).
 */
export function ReviewContact({
  review,
  principal,
}: {
  review: Review;
  principal: Principal;
}) {
  const firstName = principal.name.split(" ")[0];
  const subject = encodeURIComponent(`Re: ${review.prospect.name} site review`);
  const heading = review.contact?.heading ?? "Let's talk";
  const lede =
    review.contact?.lede ??
    `Questions about anything in this review? Reach ${firstName} directly, however suits you.`;

  return (
    <section className="review-block review-contact" id="contact">
      <div className="review-block__inner review-prose">
        <h2>{heading}</h2>
        <p>{lede}</p>
        <div className="review-contact__person">
          <div className="review-contact__avatar">
            {principal.avatar?.src ? (
              <Image
                src={principal.avatar.src}
                alt={principal.avatar.alt || principal.name}
                width={principal.avatar.width ?? 160}
                height={principal.avatar.height ?? 160}
                className="review-contact__avatar-img"
              />
            ) : (
              <DefaultAvatar
                className="review-contact__avatar-img"
                ariaLabel={`${principal.name} avatar`}
              />
            )}
          </div>
          <div>
            <p className="review-contact__name">{principal.name}</p>
            {principal.role ? (
              <p className="review-contact__role">{principal.role}</p>
            ) : null}
          </div>
        </div>
        <div className="review-contact__actions">
          <ReviewContactLink
            slug={review.slug}
            event="contact:email"
            href={`mailto:${principal.email}?subject=${subject}`}
            className={PRIMARY}
          >
            Email {firstName}
          </ReviewContactLink>
          {principal.linkedin ? (
            <ReviewContactLink
              slug={review.slug}
              event="contact:linkedin"
              href={principal.linkedin}
              className={SECONDARY}
              external
            >
              Message on LinkedIn
            </ReviewContactLink>
          ) : null}
          <LiveChatButton slug={review.slug} className={SECONDARY} />
        </div>
        <p className="review-contact__email">
          Or write to{" "}
          <a href={`mailto:${principal.email}`}>{principal.email}</a>
        </p>
      </div>
    </section>
  );
}
