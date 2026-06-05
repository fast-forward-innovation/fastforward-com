import type { Project } from "@/lib/types";
import { CaseStudyArticle } from "./CaseStudyArticle";
import { FeaturedProjects } from "./page_blocks/FeaturedProjects";
import { DraftStatusToast } from "./DraftStatusToast";

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
      {project.draft ? (
        <DraftStatusToast
          slug={project.slug}
          editorial={project.editorial ?? { status: "draft" }}
        />
      ) : null}
    </>
  );
}
