import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPages, getPageBySlug } from "@/lib/content";
import { Page } from "@/components/Page";
import { LandingPage } from "@/components/LandingPage";
import { CaseStudyPage } from "@/components/CaseStudyPage";
import { LabProjectPage } from "@/components/LabProjectPage";
import { BlogPost } from "@/components/BlogPost";
import { BlogIndex } from "@/components/BlogIndex";

// PCC-sourced lab projects can appear between builds — let Next render
// unknown slugs on first request and 404 if no Page resolves.
export const dynamicParams = true;

export async function generateStaticParams() {
  // Slugs may contain slashes (e.g. "experiences/touchscreen-interactive");
  // a catch-all segment expects an array of path parts.
  return (await getAllPages()).map((p) => ({ slug: p.slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug.join("/"));
  if (!page) return {};
  const description = page.additionalPostFields?.seoDescription;
  const meta: Metadata = { title: page.title };
  // Omitting the key (vs. setting undefined) lets the root layout's
  // siteDescription cascade through when the page has no description.
  if (description) meta.description = description;
  // Draft pages resolve by direct URL but must never be indexed.
  if (page.draft) meta.robots = { index: false, follow: false };
  return meta;
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug.join("/"));
  if (!page) notFound();

  if (page.layout === "landing") {
    return <LandingPage page={page} />;
  }
  if (page.layout === "case-study") {
    return <CaseStudyPage page={page} />;
  }
  if (page.layout === "lab-project") {
    return <LabProjectPage page={page} />;
  }
  if (page.layout === "blog") {
    return <BlogPost page={page} />;
  }
  if (page.layout === "blog-index") {
    return <BlogIndex page={page} />;
  }
  return <Page page={page} />;
}
