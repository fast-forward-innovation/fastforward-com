/**
 * Page/Project-level fixtures for the heavier component stories (full
 * articles, landing/blog pages). Block-level samples live in
 * `./sampleSections`; these compose them into whole-page props.
 */
import type { Editorial, Page, Project } from "@/lib/types";
import {
  sampleMainSection,
  sampleMainSectionGray,
  sampleImageBlockSingle,
  sampleClientQuote,
  sampleCodeBlock,
  sampleVideoLoom,
  sampleTeamIndividual,
} from "./sampleSections";

const SAMPLE_IMAGE = "/Touchscreen-1-denoise-gigapixel.jpg";

export const sampleProject: Project = {
  title: "Developing a Massive Touch-Screen Exhibit",
  slug: "developing-a-massive-touch-screen-exhibit",
  date: "2024-02-01T00:00:00",
  isSticky: false,
  excerpt: "<p>An interactive wall thousands of visitors explore each week.</p>",
  services: ["strategy", "development"],
  additionalPostFields: { label: "Case Study", brandColor: "#0f766e" },
  featuredImage: {
    src: SAMPLE_IMAGE,
    alt: "The touch-screen exhibit in the gallery",
    width: 1600,
    height: 900,
  },
  pageSections: [sampleMainSection, sampleImageBlockSingle, sampleClientQuote],
};

export const sampleDraftProject: Project = {
  ...sampleProject,
  slug: "a-draft-project",
  draft: true,
  editorial: { status: "review", branch: "feat/new-case-study", pr: 128 },
};

export const sampleLandingPage: Page = {
  title: "Transform Your Business",
  slug: "landing-example",
  date: "2024-01-01T00:00:00",
  layout: "landing",
  featuredImage: { src: SAMPLE_IMAGE, alt: "", width: 1600, height: 900 },
  contentHtml:
    "<p>We partner with ambitious teams to ship software that moves the needle.</p>",
};

export const sampleBlogPage: Page = {
  title: "How we ship content fast",
  slug: "blog/how-we-ship-content-fast",
  date: "2024-03-12T00:00:00",
  layout: "blog",
  author: { name: "Sam Carter", role: "Lead Engineer" },
  additionalPostFields: { tags: ["process", "engineering"] },
  featuredImage: {
    src: SAMPLE_IMAGE,
    alt: "Cover image",
    width: 1600,
    height: 900,
  },
  contentHtml:
    "<p>A look at the content pipeline that lets our team publish in hours, not weeks.</p><p>It starts with a strong content model…</p>",
};

export const sampleBlogIndexPage: Page = {
  title: "Think Fast",
  slug: "blog",
  date: "2024-01-01T00:00:00",
  layout: "blog-index",
  header: {
    background: SAMPLE_IMAGE,
    intro: "Notes on building fast, accessible, content-driven products.",
  },
  contentHtml: "",
};

export const sampleLabProject: Project = {
  title: "A Real-Time Advice Engine",
  slug: "real-time-advice-engine",
  date: "2024-04-01T00:00:00",
  isSticky: false,
  services: ["development"],
  additionalPostFields: {
    label: "Lab Project",
    brandColor: "#b91c1c",
    stack: ["Next.js", "TypeScript", "Edge Functions"],
    tags: ["realtime", "i18n"],
    repoUrl: "https://github.com/",
    liveUrl: "https://example.com/",
  },
  featuredImage: { src: SAMPLE_IMAGE, alt: "", width: 1600, height: 900 },
  pageSections: [
    sampleTeamIndividual,
    sampleMainSection,
    sampleCodeBlock,
    sampleMainSectionGray,
    sampleVideoLoom,
  ],
};

// Editorial states for DraftStatusToast.
export const editorialDraft: Editorial = {
  status: "draft",
  branch: "feat/new-case-study",
  updated: "2024-05-01",
};

export const editorialReviewWithPr: Editorial = {
  status: "review",
  branch: "feat/new-case-study",
  pr: 128,
  reviewers: ["jason", "sam"],
  notes: "Copy is close; needs a final pass on the metrics section.",
};

export const editorialApproved: Editorial = {
  status: "approved",
  pr: 131,
};
