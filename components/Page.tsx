import type { Page as PageData } from "@/lib/types";

export function Page({ page }: { page: PageData }) {
  return (
    <article className="section main-section wp-page">
      <div className="mx-auto">
        <div className="lg:w-4/5">
          <h1>{page.title}</h1>
          {page.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
          ) : (
            <p>Sorry, no page data was found at this route.</p>
          )}
        </div>
      </div>
    </article>
  );
}
