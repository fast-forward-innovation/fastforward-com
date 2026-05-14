export interface FrontmatterImage {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
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
   * When true, the project is hidden from public listings (home page,
   * /our-work index, sitemap) and gets a `noindex` meta tag. The direct
   * URL still resolves so the page can be shared as a preview.
   */
  draft?: boolean;
  featuredImage?: FrontmatterImage;
  cardImage?: FrontmatterImage;
  additionalPostFields?: AdditionalPostFields;
  services: string[];
  pageSections: PageSection[];
  contentHtml?: string;
}

export interface Page {
  title: string;
  slug: string;
  date: string;
  layout: "default" | "landing" | "case-study" | "lab-project";
  featuredImage?: FrontmatterImage;
  contentHtml?: string;
  additionalPostFields?: AdditionalPostFields;
  services?: string[];
  pageSections?: PageSection[];
  source?: "mdx" | "pcc-archieml" | "pcc-smart-components";
  pccArticleId?: string;
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
