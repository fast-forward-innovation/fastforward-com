import { getAllPages, getPublishedProjects, getSettings } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fastforward.sh";

// Pages that exist as scaffolding/samples and shouldn't appear in the index.
const EXCLUDED_PAGE_SLUGS = new Set(["lab-project-sample"]);

export const dynamic = "force-static";

function clean(excerpt: string | undefined): string {
  if (!excerpt) return "";
  return excerpt
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function link(title: string, url: string, description?: string): string {
  const desc = clean(description);
  return desc ? `- [${title}](${url}): ${desc}` : `- [${title}](${url})`;
}

export async function GET(): Promise<Response> {
  const settings = getSettings();
  const projects = getPublishedProjects();
  const pages = (await getAllPages()).filter(
    (p) => !p.draft && !EXCLUDED_PAGE_SLUGS.has(p.slug),
  );

  const caseStudyPages = pages.filter((p) => p.layout === "case-study");
  const defaultPages = pages.filter((p) => p.layout === "default");

  const lines: string[] = [
    `# ${settings.siteTitle}`,
    "",
    `> ${settings.siteDescription}. Fast Forward is a product studio that partners with organizations to design, build, and ship custom web, mobile, and interactive software experiences.`,
    "",
    "This site is built on Pantheon's Next.js platform. Case studies live under `/our-work/<slug>`; long-form pages live at `/<slug>`. Content is authored as MDX in this repository, with optional editing of select pages via Pantheon Content Publisher.",
    "",
    "## Case studies",
    "",
    ...projects.map((p) =>
      link(p.title, `${SITE_URL}/our-work/${p.slug}`, p.excerpt),
    ),
    "",
    "## Pages",
    "",
    link("Our Work", `${SITE_URL}/our-work`, "Index of all published case studies."),
    link("Contact", `${SITE_URL}/contact-us`, "Start a project conversation with Fast Forward."),
    ...caseStudyPages.map((p) => link(p.title, `${SITE_URL}/${p.slug}`)),
    "",
    "## Optional",
    "",
    ...defaultPages.map((p) => link(p.title, `${SITE_URL}/${p.slug}`)),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
