import type { Page as PageData } from "@/lib/types";
import { PageHero } from "./PageHero";

export function Page({ page }: { page: PageData }) {
  const header = page.header;
  const body = page.contentHtml ? (
    <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
  ) : (
    <p>Sorry, no page data was found at this route.</p>
  );

  // Dark hero header (matches /our-work) when frontmatter opts in.
  if (header?.background) {
    return (
      <>
        <PageHero header={header} title={page.title} />
        <article className="section main-section wp-page">
          <div className="mx-auto">
            <div className="lg:w-4/5">{body}</div>
          </div>
        </article>
      </>
    );
  }

  return (
    <article className="section main-section wp-page">
      <div className="mx-auto">
        <div className="lg:w-4/5">
          <h1>{page.title}</h1>
          {body}
        </div>
      </div>
    </article>
  );
}
