import type { Crumb, Project } from "@/lib/types";
import { CaseStudyArticle } from "./CaseStudyArticle";
import { FeaturedProjects } from "./page_blocks/FeaturedProjects";
import { DraftStatusToast } from "./DraftStatusToast";

export function Post({
  project,
  breadcrumbs,
}: {
  project: Project;
  breadcrumbs?: Crumb[];
}) {
  return (
    <>
      <CaseStudyArticle
        title={project.title}
        featuredImage={project.featuredImage}
        additionalPostFields={project.additionalPostFields}
        services={project.services}
        pageSections={project.pageSections}
        breadcrumbs={breadcrumbs}
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
