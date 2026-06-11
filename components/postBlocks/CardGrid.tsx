import type { CSSProperties } from "react";
import Image from "next/image";
import type { CardGrid as CardGridData } from "@/lib/types";
import { PlaceholderImage } from "./PlaceholderImage";

/**
 * A responsive grid of titled cards, each with an optional thumbnail/icon.
 * Used for "format", "audience", and feature/value sets on capability pages.
 *
 * Cards are 1-up on mobile, 2-up on tablet, and `columns`-up (default 3) at
 * desktop. Images support `placeholder` + `notes`, so a grid can ship before
 * the art exists.
 *
 * Standalone, it's its own full-width section (set its `background` to match
 * the MainSection above so the two read as one unit). `embedded` renders it
 * bare — no section wrapper or background — for nesting in a `MainSection`'s
 * content column (see {@link MainSection}'s `blocks`).
 */
export function CardGrid({
  block,
  embedded = false,
}: {
  block: CardGridData;
  embedded?: boolean;
}) {
  const cards = block.cards?.filter(Boolean) ?? [];
  if (cards.length === 0) return null;

  const columns = block.columns ?? 3;

  const list = (
    <ul
      className="card-grid__list"
      style={{ "--card-cols": columns } as CSSProperties}
    >
      {cards.map((card, i) => (
        <li key={i} className="card-grid__card">
          {card.image ? (
            <div className="card-grid__media">
              {card.image.placeholder ? (
                <PlaceholderImage
                  alt={card.image.alt || card.title}
                  width={card.image.width ?? 800}
                  height={card.image.height ?? 600}
                  notes={card.image.notes}
                  className="aspect-[4/3] w-full"
                />
              ) : (
                <Image
                  src={card.image.src}
                  alt={card.image.alt || card.title}
                  width={card.image.width ?? 800}
                  height={card.image.height ?? 600}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="aspect-[4/3] w-full object-cover"
                />
              )}
            </div>
          ) : null}
          <h3 className="card-grid__title">{card.title}</h3>
          {card.description ? (
            <p
              className="card-grid__desc"
              dangerouslySetInnerHTML={{ __html: card.description }}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );

  if (embedded) {
    return <div className="card-grid--embedded">{list}</div>;
  }

  return (
    <div
      className={`section card-grid ${block.background === "gray" ? "bg-[#f5f5f5]" : ""}`}
    >
      <div className="mx-auto">{list}</div>
    </div>
  );
}
