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
}

export interface ImageBlock {
  type: "ImageBlock";
  images: FrontmatterImage[];
  width?: "full" | "text";
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

export type PageSection =
  | MainSection
  | ImageBlock
  | ClientQuote
  | CodeBlock
  | VideoBlock
  | TeamProfile;

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
