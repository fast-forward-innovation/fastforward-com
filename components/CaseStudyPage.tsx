import type { Page as PageData } from "@/lib/types";
import { CaseStudyArticle } from "./CaseStudyArticle";

export function CaseStudyPage({
  page,
  numbered = true,
}: {
  page: PageData;
  /** Auto-number MainSections. False for the pillar-page layout. */
  numbered?: boolean;
}) {
  return (
    <CaseStudyArticle
      title={page.title}
      featuredImage={page.featuredImage}
      additionalPostFields={page.additionalPostFields}
      services={page.services}
      pageSections={page.pageSections ?? []}
      numbered={numbered}
    />
  );
}
