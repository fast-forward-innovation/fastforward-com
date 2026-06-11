import Image from "next/image";
import Link from "next/link";
import { getServiceById } from "@/lib/content";
import type { Project } from "@/lib/types";
import { PlaceholderImage } from "../postBlocks/PlaceholderImage";

export function ProjectCard({
  project,
  showServices = true,
  compact = false,
}: {
  project: Project;
  /** Show the service-tag list under the title. Hidden in compact contexts. */
  showServices?: boolean;
  /**
   * Smaller title sized to match page body content, for dense contexts like
   * the inline "recent work" carousel. The home-page grid uses the large
   * default.
   */
  compact?: boolean;
}) {
  const { slug, title, additionalPostFields, services, cardImage } = project;
  const label = additionalPostFields?.label;
  const serviceNames = services
    .map((s) => getServiceById(s)?.name)
    .filter((n): n is string => !!n);

  const titleClass = compact
    ? "text-xl leading-snug pb-3 group-hover:underline"
    : "leading-7 md:leading-9 xl:leading-10 pb-5 text-[calc(1.65rem+(100vw-975px)/200)] group-hover:underline";

  return (
    <Link
      href={`/our-work/${slug}`}
      className={`group cursor-pointer relative w-full py-6 md:p-0 max-w-lg inline-block text-left opacity-80 hover:opacity-100 transition-all duration-300 ${
        compact ? "text-base" : "text-2xl"
      }`}
    >
      {cardImage && (
        <div className="relative w-full aspect-[20/23] overflow-hidden mb-6">
          {cardImage.placeholder ? (
            <PlaceholderImage
              alt={cardImage.alt || title}
              notes={cardImage.notes}
              fill
            />
          ) : (
            <Image
              src={cardImage.src}
              alt={cardImage.alt || title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
      )}
      <div>
        {label && (
          <span className="h4 block pt-1 tracking-wider">{label}</span>
        )}
        <h3 className={titleClass}>{title}</h3>
        {showServices && (
          <ul className="pb-6 md:pb-4 leading-4">
            {serviceNames.map((name, i) => (
              <li
                key={i}
                className="font-mono text-sm uppercase tracking-wider inline list-none inline-services-style"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
