import Link from "next/link";
import { getAllProjects } from "@/lib/content";
import { ProjectCard } from "./ProjectCard";

export function FeaturedProjects({ excludeSlug }: { excludeSlug?: string }) {
  const toShow = getAllProjects()
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, 3);

  return (
    <div className="dark-background section-wide">
      <div className="relative mx-auto">
        <div className="lg:flex items-start justify-between">
          <h2 className="inline-block">Featured Projects </h2>
          <Link
            className="text-xl next-post absolute -bottom-8 left-0 inline-block lg:relative lg:mt-2 lg:mr-[25px] lg:bottom-0"
            href="/our-work"
          >
            See All Projects
          </Link>
        </div>
        <div className="my-8 md:my-0 pb-10 lg:pb-0 grid md:grid-cols-3 md:gap-8 xl:gap-[70px] mx-auto">
          {toShow.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
