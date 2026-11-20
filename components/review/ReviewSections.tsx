import type { ReactNode } from "react";
import type { ReviewSection } from "@/lib/types";
import {
  renderPageSection,
  type RenderSectionContext,
} from "../postBlocks/renderPageSection";

/**
 * A review's body. Review-only blocks render here; every other block goes
 * through the shared `renderPageSection`, so MainSection, ImageBlock, etc.
 * look exactly as they do elsewhere on the site.
 *
 * - `Prose`: plain `<h2>` + HTML in a single reading column.
 * - `HtmlEmbed`: a self-contained diagram (scoped `<style>` + `<section>`)
 *   from content/reviews/<slug>/. Authored by us, read at build time.
 */
export function ReviewSections({ sections }: { sections: ReviewSection[] }) {
  const ctx: RenderSectionContext = { mainCount: 0 };
  return sections.map((section, index): ReactNode => {
    if (section.type === "Prose") {
      return (
        <section key={index} className="review-block">
          <div className="review-block__inner review-prose">
            {section.heading ? <h2>{section.heading}</h2> : null}
            <div dangerouslySetInnerHTML={{ __html: section.html }} />
          </div>
        </section>
      );
    }
    if (section.type === "HtmlEmbed") {
      return (
        <div key={index} className="review-block">
          <div
            className="review-block__inner review-embed"
            dangerouslySetInnerHTML={{ __html: section.html ?? "" }}
          />
        </div>
      );
    }
    return renderPageSection(section, index, ctx);
  });
}
