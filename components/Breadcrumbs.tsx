import Link from "next/link";
import type { Crumb } from "@/lib/types";

/**
 * Breadcrumb trail rendered above the page title in the case-study hero.
 * The last crumb is the current page (no link). Renders nothing for a trail
 * of fewer than two crumbs.
 */
export function Breadcrumbs({ items }: { items?: Crumb[] }) {
  if (!items || items.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="breadcrumbs__list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="breadcrumbs__item">
              {item.href && !isLast ? (
                <Link href={item.href} className="breadcrumbs__link">
                  {item.label}
                </Link>
              ) : (
                <span
                  className="breadcrumbs__current"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span className="breadcrumbs__sep" aria-hidden="true">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
