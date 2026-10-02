import type { Page as PageData } from "@/lib/types";
import { renderPageSections } from "./postBlocks/renderPageSection";

/**
 * `landing`-layout renderer (Digital, Experiences). A left-aligned header on a
 * soft tint with decorative letterforms behind it, then the page's blocks.
 *
 * The frontmatter `title` is the small mono eyebrow; `header.title` is the
 * display headline. They are deliberately different strings — "Experiences"
 * over "Where Story / Meets Technology".
 */
export function LandingPage({ page }: { page: PageData }) {
  const header = page.header;
  const sections = page.pageSections?.length ? renderPageSections(page.pageSections) : null;

  return (
    <>
      <div className="landing-header">
        {header?.artwork ? (
          <div className="landing-header__artwork" aria-hidden="true">
            {/* Decorative SVG from the comp; next/image would reject it without
                `dangerouslyAllowSVG`. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={header.artwork} alt="" />
          </div>
        ) : null}
        <div className="landing-header__inner">
          <p className="landing-header__eyebrow">{page.title}</p>
          <h1 className="landing-header__title">{header?.title || page.title}</h1>
          {header?.intro ? (
            <p className="landing-header__intro">{header.intro}</p>
          ) : null}
        </div>
      </div>
      {sections}
    </>
  );
}
