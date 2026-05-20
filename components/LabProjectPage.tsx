import type { Page as PageData } from "@/lib/types";
import { LabProjectArticle } from "./LabProjectArticle";

export function LabProjectPage({ page }: { page: PageData }) {
  return (
    <LabProjectArticle
      title={page.title}
      tagline={page.additionalPostFields?.tagline}
      featuredImage={page.featuredImage}
      additionalPostFields={page.additionalPostFields}
      pageSections={page.pageSections ?? []}
      draft={page.draft}
      editorial={page.editorial}
      slug={page.slug}
    />
  );
}
