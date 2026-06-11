import type { Page as PageData } from "@/lib/types";
import { PageHero } from "./PageHero";
import { renderPageSections } from "./postBlocks/renderPageSection";

export function Page({ page }: { page: PageData }) {
  const header = page.header;
  // Default-layout pages are contentHtml-first, but may also carry full-width
  // pageSections (e.g. a ZigZag nav) rendered below the prose.
  const hasBody = !!page.contentHtml;
  const body = hasBody ? (
    <div dangerouslySetInnerHTML={{ __html: page.contentHtml ?? "" }} />
  ) : null;
  const sections = page.pageSections?.length
    ? renderPageSections(page.pageSections)
    : null;

  // Dark hero header (matches /our-work) when frontmatter opts in.
  if (header?.background) {
    return (
      <>
        <PageHero header={header} title={page.title} />
        {body && (
          <article className="section main-section wp-page">
            <div className="mx-auto">
              <div className="lg:w-4/5">{body}</div>
            </div>
          </article>
        )}
        {sections}
      </>
    );
  }

  return (
    <>
      <article className="section main-section wp-page">
        <div className="mx-auto">
          <div className="lg:w-4/5">
            <h1>{page.title}</h1>
            {body ?? <p>Sorry, no page data was found at this route.</p>}
          </div>
        </div>
      </article>
      {sections}
    </>
  );
}
