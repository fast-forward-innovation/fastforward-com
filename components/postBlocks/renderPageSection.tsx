import type { ReactNode } from "react";
import type { PageSection } from "@/lib/types";
import { MainSection } from "./MainSection";
import { ImageBlock } from "./ImageBlock";
import { CardGrid } from "./CardGrid";
import { QuoteBlock } from "./QuoteBlock";
import { CodeBlock } from "./CodeBlock";
import { VideoBlock } from "./VideoBlock";
import { TeamProfile } from "./TeamProfile";
import { FeaturedWorkBlock } from "./FeaturedWorkBlock";

export type PageSectionType = PageSection["type"];

/** Every authorable block type, in the canonical authoring order. */
export const ALL_SECTION_TYPES: readonly PageSectionType[] = [
  "MainSection",
  "ImageBlock",
  "CardGrid",
  "ClientQuote",
  "CodeBlock",
  "VideoBlock",
  "TeamProfile",
  "FeaturedWork",
];

/**
 * The subset of block types the case-study layouts render. Lab projects
 * render everything in {@link ALL_SECTION_TYPES}; case studies intentionally
 * support only narrative, imagery, and quotes.
 */
export const CASE_STUDY_SECTION_TYPES: readonly PageSectionType[] = [
  "MainSection",
  "ImageBlock",
  "CardGrid",
  "ClientQuote",
  "FeaturedWork",
];

export interface RenderSectionContext {
  /**
   * Running count of rendered `MainSection` blocks, used to drive the
   * `(01)`, `(02)`… numbering. Mutated as sections are rendered, so a single
   * context must be shared across one article's section list.
   */
  mainCount: number;
}

/**
 * Single source of truth for mapping a `PageSection` to its component. Both
 * the article layouts (`CaseStudyArticle`, `LabProjectArticle`) and the
 * `/styleguide` block gallery render through this so the gallery is always a
 * faithful preview of production output.
 *
 * When `allowedTypes` is provided, sections whose `type` isn't in the list
 * render as `null` (the case-study layouts use this to omit lab-only blocks).
 */
export function renderPageSection(
  section: PageSection,
  index: number,
  ctx: RenderSectionContext,
  allowedTypes?: readonly PageSectionType[],
  numbered = true,
): ReactNode {
  if (allowedTypes && !allowedTypes.includes(section.type)) return null;

  switch (section.type) {
    case "MainSection": {
      // `numbered: false` (pillar pages) leaves the count at 0, which
      // MainSection treats as "no marker". Default keeps the (01)/(02)… rail.
      const n = numbered ? ++ctx.mainCount : 0;
      return <MainSection key={index} section={section} mainCount={n} />;
    }
    case "ImageBlock":
      return <ImageBlock key={index} block={section} />;
    case "CardGrid":
      return <CardGrid key={index} block={section} />;
    case "ClientQuote":
      return <QuoteBlock key={index} section={section} />;
    case "CodeBlock":
      return <CodeBlock key={index} block={section} />;
    case "VideoBlock":
      return <VideoBlock key={index} block={section} />;
    case "TeamProfile":
      return <TeamProfile key={index} block={section} />;
    case "FeaturedWork":
      return <FeaturedWorkBlock key={index} block={section} />;
    default:
      return null;
  }
}

/**
 * Render a full `pageSections` array, seeding a fresh numbering context.
 */
export function renderPageSections(
  sections: PageSection[],
  allowedTypes?: readonly PageSectionType[],
  opts?: { numbered?: boolean },
): ReactNode[] {
  const numbered = opts?.numbered ?? true;
  const ctx: RenderSectionContext = { mainCount: 0 };
  return sections.map((section, index) =>
    renderPageSection(section, index, ctx, allowedTypes, numbered),
  );
}
