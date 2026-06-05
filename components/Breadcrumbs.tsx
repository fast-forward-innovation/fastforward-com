import Link from "next/link";
import type { Crumb } from "@/lib/types";

/**
 * A single "up one level" back-link rendered above the page title in the
 * case-study hero — an arrow plus the immediate parent section (e.g.
 * "← Experiences"), linking back up to it.
 *
 * Takes the full breadcrumb trail and renders only the parent (the
 * second-to-last crumb). Renders nothing when there's no linkable parent —
 * e.g. top-level pages, whose only ancestor is Home.
 */
export function Breadcrumbs({ items }: { items?: Crumb[] }) {
  if (!items || items.length < 2) return null;

  const parent = items[items.length - 2];
  if (!parent.href) return null;

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <Link href={parent.href} className="breadcrumbs__up">
        <span className="breadcrumbs__arrow" aria-hidden="true">
          &larr;
        </span>
        {parent.label}
      </Link>
    </nav>
  );
}
