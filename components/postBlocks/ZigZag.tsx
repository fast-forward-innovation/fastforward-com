import Link from "next/link";
import type { ReactNode } from "react";
import type { ZigZag as ZigZagData, ZigZagItem } from "@/lib/types";
import { PlaceholderImage } from "./PlaceholderImage";

/**
 * A stack of linked rows that alternate sides automatically (copy left / media
 * right, then swapped, via `:nth-child` in CSS). Authors just list `items` in
 * order. Visual language mirrors the site's cards: mono uppercase tags,
 * opacity-on-hover, clean square-cornered `object-cover` imagery. The
 * `diagram` flag contains the art on a soft brand panel for SVG diagrams.
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
        {item.tag ? <span className="zigzag__tag">{item.tag}</span> : null}
      </div>
      {media}
    </>
  );
}

export function ZigZag({ block }: { block: ZigZagData }) {
  const items = block.items?.filter(Boolean) ?? [];
  if (items.length === 0) return null;

  return (
    <div className="section zigzag-section">
      <div className="mx-auto">
        <div className="zigzag">
          {items.map((item, i) => {
            const inner: ReactNode = <Row item={item} />;
            const isInternal = item.href?.startsWith("/");
            return isInternal ? (
              <Link key={i} href={item.href} className="zigzag__item">
                {inner}
              </Link>
            ) : (
              <a key={i} href={item.href} className="zigzag__item">
                {inner}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
