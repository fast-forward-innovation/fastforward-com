import type { Page } from "@/lib/types";
import { CaseStudyArticle } from "./CaseStudyArticle";
import { FeaturedProjects } from "./page_blocks/FeaturedProjects";

// Case-study blog post: reuses the exact our-work project template
// (CaseStudyArticle + Featured Projects footer). The draft toast is added
// by the [...slug] route for any draft page, so it's intentionally omitted
// here to avoid rendering two toasts.
export function BlogCaseStudy({ page }: { page: Page }) {
  return (
    <>
      <CaseStudyArticle
        title={page.title}
        featuredImage={page.featuredImage}
        additionalPostFields={page.additionalPostFields}
        services={page.services}
        pageSections={page.pageSections ?? []}
      />
      <FeaturedProjects />
    </>
  );
}
