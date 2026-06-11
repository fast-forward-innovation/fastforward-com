import Link from "next/link";
import { getPublishedProjects } from "@/lib/content";
import type { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";

export function FeaturedProjects({
  excludeSlug,
  projects,
  title = "Featured Projects",
  seeAllHref = "/our-work",
  layout = "grid",
  embedded = false,
}: {
  excludeSlug?: string;
  /** Curated projects to show, in order. Omit to auto-pick the latest three. */
  projects?: Project[];
  /** Heading text. */
  title?: string;
  /** "See all" link target; pass an empty string to hide the link. */
  seeAllHref?: string;
  /**
   * `"grid"` (default) — the home-page 3-up grid. `"scroll"` — a fixed-width,
   * single-line carousel that always scrolls horizontally; used for curated
   * "recent work" bands where the count would otherwise wrap.
   */
  layout?: "grid" | "scroll";
  /**
   * Render bare for embedding inside a section's content column: no section
   * wrapper, no heading / "see all" chrome — just the cards. Implies the
   * scroll layout. The surrounding content provides width and padding.
   */
  embedded?: boolean;
}) {
  const toShow =
    projects ??
    getPublishedProjects()
      .filter((p) => p.slug !== excludeSlug)
      .slice(0, 3);

  // The "scroll" variant is an inline carousel that aligns to the case-study
  // content column (.section, max 80rem) and inherits the surrounding page
  // background; the default "grid" variant keeps the home page's full-bleed
  // dark band (.section-wide).
  const isScroll = layout === "scroll" || embedded;

  const cards = isScroll ? (
    <ul className="featured-projects__scroller my-8 flex flex-nowrap items-start gap-6 md:gap-8 overflow-x-auto list-none">
      {toShow.map((p) => (
        <li
          key={p.slug}
          className="shrink-0 snap-start w-[280px] md:w-[340px] xl:w-[380px]"
        >
          <ProjectCard project={p} showServices={false} compact />
        </li>
      ))}
    </ul>
  ) : (
    <div className="my-8 md:my-0 pb-10 lg:pb-0 grid md:grid-cols-3 md:gap-8 xl:gap-[70px] mx-auto">
      {toShow.map((p) => (
        <ProjectCard key={p.slug} project={p} />
      ))}
    </div>
  );

  // Embedded: drop the section + heading chrome and let the parent content
  // column provide width/padding. The carousel is the whole block.
  if (embedded) {
    return <div className="featured-projects--embedded">{cards}</div>;
  }

  return (
    <div
      className={
        isScroll
          ? "section featured-projects--inline"
          : "dark-background section-wide"
      }
    >
      <div className="relative mx-auto">
        <div className="lg:flex items-start justify-between">
          <h2 className="inline-block">{title} </h2>
          {seeAllHref ? (
            <Link
              className="text-xl next-post absolute -bottom-8 left-0 inline-block lg:relative lg:mt-2 lg:mr-[25px] lg:bottom-0"
              href={seeAllHref}
            >
              See All Projects
            </Link>
          ) : null}
        </div>
        {cards}
      </div>
    </div>
  );
}
