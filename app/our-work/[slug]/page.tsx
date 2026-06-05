import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/content";
import { Post } from "@/components/Post";
import { JsonLd } from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fastforward.sh";

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
  const projectUrl = `${SITE_URL}/our-work/${project.slug}`;
  const description = stripHtml(project.excerpt) || undefined;
  const imageSrc = project.featuredImage?.src;
  const imageUrl = imageSrc
    ? new URL(imageSrc, SITE_URL).toString()
    : undefined;
  const clientName = project.additionalPostFields?.label;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${SITE_URL}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Our Work",
              item: `${SITE_URL}/our-work`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: project.title,
              item: projectUrl,
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          ...(description ? { description } : {}),
          url: projectUrl,
          ...(project.date ? { datePublished: project.date } : {}),
          ...(imageUrl ? { image: imageUrl } : {}),
          ...(clientName
            ? { about: { "@type": "Organization", name: clientName } }
            : {}),
          author: {
            "@type": "Organization",
            name: "Fast Forward",
            url: SITE_URL,
          },
        }}
      />
      <Post
        project={project}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Our Work", href: "/our-work" },
          { label: project.title },
        ]}
      />
    </>
  );
}
