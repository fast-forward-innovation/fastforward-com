import { useId } from "react";

/**
 * White blog callout: gradient top bar, eyebrow, title, and a numbered list
 * of five short lines. Spec: docs/design/callouts/five-fears.dc.html and
 * five-advantages.dc.html. Styles live under `.ff-callout` in globals.css.
 *
 * Rendered as a labelled <aside> rather than a heading so the post's own
 * section headings stay the document outline.
 */
export function NumberedCallout({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: "red" | "teal";
}) {
  const titleId = useId();

  return (
    <div className="ff-callout">
      <aside
        className={`ff-callout__card ff-callout--light ff-callout--${accent}`}
        aria-labelledby={titleId}
      >
        <div className="ff-callout__bar" aria-hidden />
        <div className="ff-callout__body">
          <div className="ff-callout__head">
            <p className="ff-callout__eyebrow">
              WordPress to Next.js · MIT-Ayiti case study
            </p>
            <p id={titleId} className="ff-callout__title">
              {title}
            </p>
          </div>
          <ol className="ff-callout__list">
            {items.map((item, i) => (
              <li key={item} className="ff-callout__item">
                <span className="ff-callout__disc" aria-hidden>
                  {i + 1}
                </span>
                <span className="ff-callout__text">{item}</span>
              </li>
            ))}
          </ol>
          <div className="ff-callout__footer">
            <span>preview.mit-ayiti.net · Next.js, Pantheon P1, Firebase</span>
            <span className="ff-callout__brand">fastforward.sh</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
