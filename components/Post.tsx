import type { Project } from "@/lib/types";
import { CaseStudyArticle } from "./CaseStudyArticle";
import { FeaturedProjects } from "./page_blocks/FeaturedProjects";

export function Post({ project }: { project: Project }) {
  return (
    <>
      <CaseStudyArticle
        title={project.title}
        featuredImage={project.featuredImage}
        additionalPostFields={project.additionalPostFields}
        services={project.services}
        pageSections={project.pageSections}
      />
      <FeaturedProjects excludeSlug={project.slug} />
    </>
  );
}
