import Link from "next/link";
import type { ReactNode } from "react";
import type { ZigZag as ZigZagData, ZigZagItem } from "@/lib/types";
import { PlaceholderImage } from "./PlaceholderImage";

/**
 * A stack of linked rows that alternate sides automatically (via `:nth-child`
 * in CSS — authors just list `items` in order). Each row is a soft grey copy
 * card overlapping the edge of a wide photograph: card left / media right,
 * then swapped. Below `md` the overlap is dropped and the two stack, media
 * first, because a 201px pull would crush the copy on a phone.
 *
 * The `diagram` flag marks rows whose media is artwork rather than a
 * photograph — a logo lockup or an architecture diagram. Those drop the
 * overlap, because the card would land on the art itself instead of a
 * photo's dead space, and the art is contained rather than cover-cropped.
 */
function Row({ item }: { item: ZigZagItem }) {
  const img = item.image;
  const media = (
    <div
      className={`zigzag__media ${item.diagram ? "zigzag__media--diagram" : ""}`}
    >
      {img?.placeholder ? (
        <PlaceholderImage alt={img.alt || item.title} notes={img.notes} fill />
      ) : img?.src ? (
        // Native <img>: these rows mix raster art with architecture SVGs, and
        // next/image rejects SVG without `dangerouslyAllowSVG`. Sizing/cover is
        // handled by the `.zigzag__media img` CSS.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.src} alt={img.alt || item.title} loading="lazy" />
      ) : null}
    </div>
  );

  return (
    <>
      <div className="zigzag__body">
        <h2 className="zigzag__title">{item.title}</h2>
        {item.description ? (
          <p className="zigzag__desc">{item.description}</p>
        ) : null}
        {item.bullets?.length ? (
          <ul className="zigzag__list">
            {item.bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        ) : null}
        <span className="zigzag__link">
          {item.linkLabel || `Explore ${item.title}`}
          {/* Decorative: the label already names the destination. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/chevron-right.svg" alt="" width={20} height={20} aria-hidden="true" />
        </span>
      </div>
      {media}
    </>
  );
}

export function ZigZag({ block }: { block: ZigZagData }) {
  const items = block.items?.filter(Boolean) ?? [];
  if (items.length === 0) return null;

  return (
    <div className="section zigzag-section pt-0">
      <div className="mx-auto">
        <div className="zigzag">
          {items.map((item, i) => {
            const inner: ReactNode = <Row item={item} />;
            const isInternal = item.href?.startsWith("/");
            // Logo/diagram rows opt out of the card-over-image overlap — the
            // card would cover the artwork rather than a photo's dead space.
            const cls = `zigzag__item ${item.diagram ? "zigzag__item--diagram" : ""}`;
            return isInternal ? (
              <Link key={i} href={item.href} className={cls}>
                {inner}
              </Link>
            ) : (
              <a key={i} href={item.href} className={cls}>
                {inner}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
