import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@/lib/types";

/**
 * Ad-style promo band. A solid colour panel with an optional logo tile on
 * the left and an eyebrow, headline, copy and optional CTA on the right.
 * Stacks on phones. Never numbered.
 */
export function BannerBlock({ block }: { block: Banner }) {
  const panelStyle = block.background
    ? { backgroundColor: block.background }
    : undefined;

  return (
    <div className="section banner-section">
      <aside
        className={`ff-banner mx-auto ${block.darkText ? "ff-banner--dark-text" : ""}`}
        style={panelStyle}
        aria-label={block.eyebrow ?? block.title}
      >
        {block.logo ? (
          <div className="ff-banner__logo">
            <Image
              src={block.logo.src}
              alt={block.logo.alt}
              width={block.logo.width ?? 400}
              height={block.logo.height ?? 300}
              sizes="(min-width: 768px) 240px, 50vw"
            />
          </div>
        ) : null}
        <div className="ff-banner__body">
          {block.eyebrow ? (
            <p className="ff-banner__eyebrow">{block.eyebrow}</p>
          ) : null}
          <p className="ff-banner__title">{block.title}</p>
          {block.text ? (
            <div
              className="ff-banner__text"
              dangerouslySetInnerHTML={{ __html: block.text }}
            />
          ) : null}
          {block.cta ? (
            <Link href={block.cta.href} className="ff-banner__cta">
              {block.cta.label} <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
