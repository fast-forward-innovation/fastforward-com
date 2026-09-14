import type { Page as PageData } from "@/lib/types";
import { renderPageSections } from "./postBlocks/renderPageSection";

export function LandingPage({ page }: { page: PageData }) {
  const header = page.header;
  const sections = page.pageSections?.length ? renderPageSections(page.pageSections) : null;

  return (
    <>
      <div className="section">
        <div className="mx-auto">
          <h1 className="font-mono text-base text-ff_red text-center uppercase pb-6">{page.title}</h1>
          <h2 className="h1 text-center whitespace-pre-line">{header?.title}</h2>
          <p className="text-center pt-2 md:text-lg lg:text-base text-ff_darkGray max-w-[60ch] mx-auto">
            {header?.intro}
          </p>
        </div>
      </div>
      {sections}
    </>
  );
}
