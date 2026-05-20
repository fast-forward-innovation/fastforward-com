import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/content";
import { Post } from "@/components/Post";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  const description =
    project.additionalPostFields?.seoDescription ||
    stripHtml(project.excerpt);
  const meta: Metadata = { title: project.title };
  // Omitting the key (vs. setting undefined) lets the root layout's
  // siteDescription cascade through when the project has no description.
  if (description) meta.description = description;
  if (project.draft) meta.robots = { index: false, follow: false };
  return meta;
}

function stripHtml(value: string | undefined): string {
  if (!value) return "";
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  return <Post project={project} />;
}
