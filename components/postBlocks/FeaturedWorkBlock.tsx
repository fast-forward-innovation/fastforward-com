import { getProjectBySlug } from "@/lib/content";
import type { FeaturedWork } from "@/lib/types";
import { FeaturedProjects } from "../page_blocks/FeaturedProjects";

/**
 * Renders a curated set of projects as a single-line scrolling carousel of
 * `ProjectCard`s. Slugs that don't resolve to a published project are skipped;
 * an empty result renders nothing.
 *
 * `embedded` strips the heading / section chrome so the carousel can live
 * inside a `MainSection`'s content column (see {@link MainSection}'s `blocks`).
 */
export function FeaturedWorkBlock({
  block,
  embedded = false,
}: {
  block: FeaturedWork;
  embedded?: boolean;
}) {
  const projects = (block.slugs ?? [])
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => p != null);

  if (projects.length === 0) return null;

  return (
    <FeaturedProjects projects={projects} layout="scroll" embedded={embedded} />
  );
}
