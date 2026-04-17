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
}

export interface ClientQuote {
  type: "ClientQuote";
  clientName?: string;
  tagline?: string;
  quote?: string;
}

export type PageSection = MainSection | ImageBlock | ClientQuote;

export interface AdditionalPostFields {
  label?: string;
  brandColor?: string;
  seoDescription?: string;
}

export interface Project {
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  isSticky: boolean;
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
  layout: "default" | "landing";
  featuredImage?: FrontmatterImage;
  contentHtml: string;
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
