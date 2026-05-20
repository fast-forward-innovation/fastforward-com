import Image from "next/image";
import type {
  AdditionalPostFields,
  Editorial,
  FrontmatterImage,
  PageSection,
} from "@/lib/types";
import { MainSection } from "./postBlocks/MainSection";
import { ImageBlock } from "./postBlocks/ImageBlock";
import { QuoteBlock } from "./postBlocks/QuoteBlock";
import { CodeBlock } from "./postBlocks/CodeBlock";
import { VideoBlock } from "./postBlocks/VideoBlock";
import { TeamProfile } from "./postBlocks/TeamProfile";
import { PlaceholderImage } from "./postBlocks/PlaceholderImage";
import { DraftStatusToast } from "./DraftStatusToast";

function hexToRgba(hex: string, alpha = 0.12) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function LabProjectArticle({
  title,
  tagline,
  featuredImage,
  additionalPostFields,
  pageSections,
  draft,
  editorial,
  slug,
}: {
  title: string;
  tagline?: string;
  featuredImage?: FrontmatterImage;
  additionalPostFields?: AdditionalPostFields;
  pageSections: PageSection[];
  draft?: boolean;
  editorial?: Editorial;
  slug?: string;
}) {
  const backgroundColor = additionalPostFields?.brandColor
    ? hexToRgba(additionalPostFields.brandColor)
    : "#ebf2f6";

  const stack = additionalPostFields?.stack ?? [];
  const tags = additionalPostFields?.tags ?? [];
  const repoUrl = additionalPostFields?.repoUrl;
  const liveUrl = additionalPostFields?.liveUrl;
  const label = additionalPostFields?.label ?? "Lab Project";

  let mainCount = 0;
  const renderedSections = pageSections.map((section, index) => {
    if (section.type === "MainSection") {
      mainCount++;
      return <MainSection key={index} section={section} mainCount={mainCount} />;
    }
    if (section.type === "ImageBlock") {
      return <ImageBlock key={index} block={section} />;
    }
    if (section.type === "ClientQuote") {
      return <QuoteBlock key={index} section={section} />;
    }
    if (section.type === "CodeBlock") {
      return <CodeBlock key={index} block={section} />;
    }
    if (section.type === "VideoBlock") {
      return <VideoBlock key={index} block={section} />;
    }
    if (section.type === "TeamProfile") {
      return <TeamProfile key={index} block={section} />;
    }
    return null;
  });

  return (
    <article className="our-work-post lab-project-post">
      <div
        className="relative z-0"
        style={{
          background: `linear-gradient(158.44deg, rgba(0, 0, 0, 0.05) 5.69%, ${backgroundColor} 63.1%)`,
        }}
        id="post-header"
      >
        <div className="section-wide md:pt-40 pb-0">
          <div className="mx-auto pb-8 sm:pb-20">
            <div className="sm:inline-block sm:w-fit sm:max-w-4/5 md:w-3/5 sm:mr-6 align-top">
              <span className="lab-eyebrow">
                <span className="lab-eyebrow__dot" aria-hidden />
                {label}
              </span>
              <h1 className="max-w-4xl pb-6">{title}</h1>
              {tagline ? <p className="lab-tagline">{tagline}</p> : null}
              {(repoUrl || liveUrl) && (
                <div className="lab-links">
                  {repoUrl ? (
                    <a
                      className="lab-links__link"
                      href={repoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View repository ↗
                    </a>
                  ) : null}
                  {liveUrl ? (
                    <a
                      className="lab-links__link"
                      href={liveUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live demo ↗
                    </a>
                  ) : null}
                </div>
              )}
            </div>
            {(stack.length > 0 || tags.length > 0) && (
              <div className="inline-block w-fit align-top mt-8 sm:mt-0 space-y-6">
                {stack.length > 0 && (
                  <div>
                    <span className="font-mono tracking-wider uppercase text-xs md:text-md">
                      Stack:
                    </span>
                    <ul className="lab-stack">
                      {stack.map((s) => (
                        <li key={s} className="lab-stack__chip">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tags.length > 0 && (
                  <div>
                    <span className="font-mono tracking-wider uppercase text-xs md:text-md">
                      Tags:
                    </span>
                    <ul className="lab-stack">
                      {tags.map((t) => (
                        <li key={t} className="lab-stack__chip lab-stack__chip--tag">
                          {t}
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
      {draft && slug ? (
        <DraftStatusToast
          slug={slug}
          editorial={editorial ?? { status: "draft" }}
        />
      ) : null}
    </article>
  );
}
