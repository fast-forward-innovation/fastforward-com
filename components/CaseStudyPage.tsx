import type { Page as PageData } from "@/lib/types";
import { getPageBreadcrumbs } from "@/lib/content";
import { CaseStudyArticle } from "./CaseStudyArticle";

export async function CaseStudyPage({ page }: { page: PageData }) {
  const breadcrumbs = await getPageBreadcrumbs(page);
  return (
    <CaseStudyArticle
      title={page.title}
      featuredImage={page.featuredImage}
      additionalPostFields={page.additionalPostFields}
      services={page.services}
      pageSections={page.pageSections ?? []}
      breadcrumbs={breadcrumbs}
    />
  );
}
