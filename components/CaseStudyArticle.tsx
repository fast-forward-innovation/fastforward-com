import Image from "next/image";
import { getServiceById } from "@/lib/content";
import type {
  AdditionalPostFields,
  FrontmatterImage,
  PageSection,
} from "@/lib/types";
import { PlaceholderImage } from "./postBlocks/PlaceholderImage";
import {
  renderPageSections,
  CASE_STUDY_SECTION_TYPES,
} from "./postBlocks/renderPageSection";

function hexToRgba(hex: string, alpha = 0.17) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function CaseStudyArticle({
  title,
  featuredImage,
  additionalPostFields,
  services = [],
  pageSections,
  numbered = true,
}: {
  title: string;
  featuredImage?: FrontmatterImage;
  additionalPostFields?: AdditionalPostFields;
  services?: string[];
  pageSections: PageSection[];
  /** Auto-number MainSections `(01)/(02)…`. False for the pillar-page layout. */
  numbered?: boolean;
}) {
  const backgroundColor = additionalPostFields?.brandColor
    ? hexToRgba(additionalPostFields.brandColor)
    : "#ebf2f6";

  const serviceNames = services
    .map((s) => getServiceById(s)?.name)
    .filter((n): n is string => !!n);

  // Case studies render only narrative, imagery, and quote blocks; lab-only
  // block types (code, video, team) are omitted by the allow-list.
  const renderedSections = renderPageSections(
    pageSections,
    CASE_STUDY_SECTION_TYPES,
    { numbered },
  );

  return (
    <article className="our-work-post">
      <div
        className="relative z-0"
        style={{
          background: `linear-gradient(158.44deg, rgba(0, 0, 0, 0.05) 5.69%, ${backgroundColor} 63.1%)`,
        }}
        id="post-header"
      >
        <div className="section-wide md:pt-40 pb-0">
          <div className="mx-auto pb-8 sm:pb-20">
            {additionalPostFields?.label ? (
              <div>
                <div className="sm:inline-block sm:w-fit sm:max-w-4/5 md:w-4/5 sm:mr-6">
                  <span className="block text-lg md:text-[1.5rem] pb-3 md:pb-5 lg:pb-8 font-medium">
                    {additionalPostFields.label}
                  </span>
                  <h1 className="max-w-4xl pb-12">{title}</h1>
                </div>
                {serviceNames.length > 0 && (
                  <div className="inline-block w-fit align-top">
                    <span className="font-mono tracking-wider uppercase text-xs md:text-md">
                      Services:
                    </span>
                    <ul className="list-disc list-inside pt-2 leading-5">
                      {serviceNames.map((n) => (
                        <li
                          key={n}
                          className="text-sm md:text-md pl-2 inline list-item pb-2"
                        >
                          {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="sm:inline-block sm:w-fit sm:max-w-4/5 md:w-4/5 sm:mr-6">
                  <h1 className="h1 max-w-4xl pt-0 pb-12">{title}</h1>
                </div>
                {serviceNames.length > 0 && (
                  <div className="inline-block w-fit align-top">
                    <span className="font-mono tracking-wider uppercase text-xs md:text-md">
                      Services:
                    </span>
                    <ul className="list-disc list-inside pt-2">
                      {serviceNames.map((n) => (
                        <li
                          key={n}
                          className="text-sm md:text-md pl-2 inline list-item pb-2"
                        >
                          {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {featuredImage && (
          <div id="featured-image" className="relative mb-[4.5rem] lg:px-6">
            {featuredImage.placeholder ? (
              <PlaceholderImage
                alt={featuredImage.alt || title}
                width={featuredImage.width ?? 1600}
                height={featuredImage.height ?? 900}
                notes={featuredImage.notes}
                className="max-lg:h-[60vh] w-full"
              />
            ) : (
              <Image
                src={featuredImage.src}
                alt={featuredImage.alt || title}
                width={featuredImage.width ?? 1600}
                height={featuredImage.height ?? 900}
                priority
                sizes="100vw"
                className="max-lg:h-[60vh] object-cover w-full"
              />
            )}
          </div>
        )}
      </div>

      {renderedSections}
    </article>
  );
}
