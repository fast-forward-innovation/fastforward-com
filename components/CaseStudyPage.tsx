import type { Page as PageData } from "@/lib/types";
import { CaseStudyArticle } from "./CaseStudyArticle";

export function CaseStudyPage({ page }: { page: PageData }) {
  return (
    <CaseStudyArticle
      title={page.title}
      featuredImage={page.featuredImage}
      additionalPostFields={page.additionalPostFields}
      services={page.services}
      pageSections={page.pageSections ?? []}
    />
  );
}
