export interface FrontmatterImage {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
  /**
   * When true, render a styled placeholder (alt text + optional designer
   * notes on a light-gray background) in place of the image. Use during
   * drafting when the final image hasn't been produced yet.
   */
  placeholder?: boolean;
  /**
   * Optional designer guidance — what the eventual image should look like.
   * Only shown when `placeholder` is true.
   */
  notes?: string;
}

export interface MainSection {
  type: "MainSection";
  tagline?: string;
  title?: string;
  background?: string;
  richText?: string;
  /**
   * Blocks embedded inside this section's content column, rendered after
   * `richText`. Lets a block like {@link FeaturedWork} live *inside* a section
   * (sharing its number + heading) rather than being its own top-level section.
   */
  blocks?: EmbeddableBlock[];
}

/**
 * Blocks that may be nested inside a {@link MainSection}'s `blocks` array,
 * rendered bare in the section's content column. Widen as more blocks become
 * embeddable.
 */
export type EmbeddableBlock = CardGrid | FeaturedWork;

export interface ImageBlock {
  type: "ImageBlock";
  images: FrontmatterImage[];
  width?: "full" | "text";
}

export interface Card {
  /** Card heading (Title Case noun phrase). */
  title: string;
  /** Supporting copy. Plain text or inline HTML. */
  description?: string;
  /**
   * Optional thumbnail / icon shown above the title. Supports `placeholder`
   * + `notes` like any {@link FrontmatterImage}, so cards can ship with art
   * pending.
   */
  image?: FrontmatterImage;
}

export interface CardGrid {
  type: "CardGrid";
  cards: Card[];
  /** Columns at desktop width. Mobile is always 1, tablet 2. Default 3. */
  columns?: 2 | 3 | 4;
  /** Section background tint, matched to the MainSection it follows. */
  background?: "white" | "gray";
}

export interface ClientQuote {
  type: "ClientQuote";
  clientName?: string;
  tagline?: string;
  quote?: string;
}

export interface CodeBlock {
  type: "CodeBlock";
  title?: string;
  filename?: string;
  language?: string;
  code: string;
  caption?: string;
}

export interface VideoBlock {
  type: "VideoBlock";
  provider?: "loom" | "youtube" | "file";
  src: string;
  title?: string;
  caption?: string;
  aspectRatio?: string;
  poster?: string;
}

export interface TeamProfile {
  type: "TeamProfile";
  kind?: "individual" | "team";
  name: string;
  role?: string;
  bio?: string;
  avatar?: FrontmatterImage;
  links?: { label: string; url: string }[];
}

/**
 * A curated "recent work" carousel of `ProjectCard`s — a hand-picked, ordered
 * set of projects (unlike the auto-picked home page block). Designed to be
 * embedded inside a {@link MainSection}'s `blocks`, where it renders inline in
 * the content column and scrolls horizontally.
 */
export interface FeaturedWork {
  type: "FeaturedWork";
  /** Project slugs to feature, in display order. */
  slugs: string[];
}

/** One row of a {@link ZigZag} block: copy on one side, media on the other. */
export interface ZigZagItem {
  /** Destination. Internal paths (`/…`) use `next/link`; absolute URLs render a plain anchor. */
  href: string;
  /** Row heading. */
  title: string;
  /** Supporting copy (plain text). */
  description?: string;
  /** Mono uppercase category tag shown below the copy, with a trailing arrow. */
  tag?: string;
  /** Row media. Supports `placeholder` + `notes` like any image. */
  image: FrontmatterImage;
  /** Contain the art on a soft brand panel instead of cover-cropping — for diagrams / SVGs. */
  diagram?: boolean;
}

/**
 * A vertical stack of linked rows that alternate sides — copy left / media
 * right, then media left / copy right, automatically. Used for section
 * navigation (the digital/ and experiences/ index "pillar" pages) and any
 * "explore these areas" set.
 */
export interface ZigZag {
  type: "ZigZag";
  items: ZigZagItem[];
}

export type PageSection =
  | MainSection
  | ImageBlock
  | CardGrid
  | ClientQuote
  | CodeBlock
  | VideoBlock
  | TeamProfile
  | FeaturedWork
  | ZigZag;

export interface AdditionalPostFields {
  label?: string;
  tagline?: string;
  brandColor?: string;
  seoDescription?: string;
  stack?: string[];
  tags?: string[];
  repoUrl?: string;
  liveUrl?: string;
}

export interface Project {
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  isSticky: boolean;
  /**
   * When true on the Live environment, the project is hidden from public
   * listings (home page, /our-work index, sitemap) and gets a `noindex`
   * meta tag; the direct URL still resolves so the page can be shared as
   * a preview. On any non-Live environment (Pantheon multidev, test, dev,
   * local) drafts are visible everywhere so reviewers can browse them.
   */
  draft?: boolean;
  editorial?: Editorial;
  featuredImage?: FrontmatterImage;
  cardImage?: FrontmatterImage;
  additionalPostFields?: AdditionalPostFields;
  services: string[];
  pageSections: PageSection[];
  contentHtml?: string;
}

export interface PageAuthor {
  name: string;
  role?: string;
  avatar?: FrontmatterImage;
}

export interface Page {
  title: string;
  slug: string;
  date: string;
  layout:
    | "default"
    | "landing"
    | "case-study"
    | "pillar-page"
    | "lab-project"
    | "blog"
    | "blog-case-study"
    | "blog-index";
  /**
   * Same semantics as `Project.draft`. The lab-project layout surfaces
   * this in the UI (via `DraftStatusToast`). For listing-aware layouts
   * (e.g. the `blog-index`) drafts are filtered on Live by
   * `getPublishedPages` / `getBlogPosts`; the `[...slug]` route also adds
   * a `noindex` robots meta to any draft page.
   */
  draft?: boolean;
  editorial?: Editorial;
  featuredImage?: FrontmatterImage;
  /**
   * Optional dark hero header for `default`-layout pages. When present, the
   * `Page` renderer shows a full-bleed background image with the page title
   * (and optional intro) on a dark overlay — matching the `/our-work`
   * header — instead of the plain inline `<h1>`.
   */
  header?: {
    background: string;
    intro?: string;
  };
  contentHtml?: string;
  additionalPostFields?: AdditionalPostFields;
  services?: string[];
  pageSections?: PageSection[];
  /**
   * Blog (`layout: "blog"`) byline. Ignored by other layouts.
   */
  author?: PageAuthor;
  /**
   * When true on a blog post, floats it to the top of the `/blog`
   * auto-listing ahead of unpinned posts (then sorted by date). Mirrors
   * the `isSticky` behavior on projects.
   */
  pinned?: boolean;
  source?: "mdx" | "pcc-archieml" | "pcc-smart-components";
  pccArticleId?: string;
}

export type EditorialStatus =
  | "draft"
  | "review"
  | "revisions"
  | "approved"
  | "live";

/**
 * Optional `editorial:` frontmatter block. Tracks where a draft sits in
 * the review workflow. Surfaced in the UI by `DraftStatusToast` on draft
 * project case studies and lab projects; written by the `/workflow` skill
 * during state transitions. Removed entirely when content reaches `live`.
 */
export interface Editorial {
  status: EditorialStatus;
  branch?: string;
  pr?: number;
  updated?: string;
  reviewers?: string[];
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
}

export interface Settings {
  siteTitle: string;
  siteDescription: string;
  postsPerPage: number;
  gaTrackingId: string;
}
