#!/usr/bin/env node
/**
 * One-shot exporter: WordPress (WPGraphQL) → markdown/YAML + local images.
 *
 * Re-runnable: overwrites content/ and public/content/images/ cleanly.
 * Writes content into this repo's ./content/ and images into ./public/content/images/.
 *
 * Run from repo root:  node scripts/export-wp-to-markdown.mjs
 * Optional env: WPGRAPHQL_URL (defaults to dev Pantheon CMS).
 */

import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const contentDir = path.join(repoRoot, "content");
const imagesDir = path.join(repoRoot, "public", "content", "images");

const WPGRAPHQL_URL =
  process.env.WPGRAPHQL_URL ||
  "https://dev-fast-forward-cms.pantheonsite.io/wp/graphql";

// Pantheon serves uploads under /app/uploads/; stock WP uses /wp-content/uploads/.
// Match either and capture the tail (year/month/filename…).
const WP_UPLOADS_PREFIXES = ["/app/uploads/", "/wp-content/uploads/"];

// Tracks unique media so we only download each file once.
// Keyed by sourceUrl, value is { localPath, width, height, altText }.
const mediaRegistry = new Map();

const warnings = [];
const stats = {
  pages: 0,
  projects: 0,
  services: 0,
  mediaDownloaded: 0,
  mediaSkipped: 0,
};

// ---------------------------------------------------------------------------
// GraphQL helpers
// ---------------------------------------------------------------------------

async function gql(query, variables = {}) {
  const res = await fetch(WPGRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors:\n${JSON.stringify(json.errors, null, 2)}`);
  }
  return json.data;
}

// ---------------------------------------------------------------------------
// Media handling
// ---------------------------------------------------------------------------

/** Convert a WP media sourceUrl to a local repo-relative path and register for download. */
function registerMedia(mediaItem) {
  if (!mediaItem || !mediaItem.sourceUrl) return null;
  const { sourceUrl, altText, mediaDetails } = mediaItem;

  const existing = mediaRegistry.get(sourceUrl);
  if (existing) return existing;

  const u = new URL(sourceUrl);
  const pathname = u.pathname;
  const matchedPrefix = WP_UPLOADS_PREFIXES.find((p) => pathname.includes(p));
  if (!matchedPrefix) {
    warnings.push(
      `Media URL not under ${WP_UPLOADS_PREFIXES.join(" or ")}: ${sourceUrl}`,
    );
    return null;
  }
  const relative = pathname.substring(
    pathname.indexOf(matchedPrefix) + matchedPrefix.length,
  );
  const record = {
    sourceUrl,
    relative, // e.g. "2024/06/hero.jpg"
    localPath: `/content/images/${relative}`,
    altText: altText || "",
    width: mediaDetails?.width ?? null,
    height: mediaDetails?.height ?? null,
  };
  mediaRegistry.set(sourceUrl, record);
  return record;
}

/** Public frontmatter shape for an image reference. */
function imageFm(mediaItem) {
  const rec = registerMedia(mediaItem);
  if (!rec) return null;
  return {
    src: rec.localPath,
    alt: rec.altText,
    width: rec.width,
    height: rec.height,
  };
}

async function downloadAllMedia() {
  const entries = Array.from(mediaRegistry.values());
  console.log(`Downloading ${entries.length} unique media files…`);
  // Simple concurrency of 8.
  const concurrency = 8;
  let i = 0;
  async function worker() {
    while (i < entries.length) {
      const idx = i++;
      const m = entries[idx];
      const dest = path.join(imagesDir, m.relative);
      await mkdir(path.dirname(dest), { recursive: true });
      try {
        const res = await fetch(m.sourceUrl);
        if (!res.ok) {
          warnings.push(`Download failed HTTP ${res.status}: ${m.sourceUrl}`);
          stats.mediaSkipped++;
          continue;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        await writeFile(dest, buf);
        stats.mediaDownloaded++;
        if ((idx + 1) % 25 === 0) {
          console.log(`  ${idx + 1}/${entries.length} downloaded`);
        }
      } catch (err) {
        warnings.push(`Download error: ${m.sourceUrl} — ${err.message}`);
        stats.mediaSkipped++;
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
}

// ---------------------------------------------------------------------------
// Writers
// ---------------------------------------------------------------------------

async function writeYaml(filepath, obj) {
  const body = yaml.dump(obj, { lineWidth: 120, quotingType: '"' });
  await mkdir(path.dirname(filepath), { recursive: true });
  await writeFile(filepath, body);
}

/** Write an MDX file with frontmatter + body. `body` may be empty string. */
async function writeMdx(filepath, frontmatter, body = "") {
  await mkdir(path.dirname(filepath), { recursive: true });
  // gray-matter's stringify produces `---\n...yaml...\n---\n{body}\n`
  const out = matter.stringify(body, frontmatter);
  await writeFile(filepath, out);
}

// ---------------------------------------------------------------------------
// Transform: WP → frontmatter
// ---------------------------------------------------------------------------

function compactNull(obj) {
  // Drop null/undefined values recursively so frontmatter stays clean.
  if (Array.isArray(obj)) return obj.map(compactNull);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v == null) continue;
      const c = compactNull(v);
      if (c === undefined) continue;
      if (Array.isArray(c) && c.length === 0) continue;
      if (
        typeof c === "object" &&
        !Array.isArray(c) &&
        Object.keys(c).length === 0
      )
        continue;
      out[k] = c;
    }
    return out;
  }
  return obj;
}

function transformSection(section) {
  // section.__typename determines variant
  switch (section.__typename) {
    case "Post_Pagesections_Sections_MainSection":
      return {
        type: "MainSection",
        tagline: section.tagline,
        title: section.title,
        background: section.background,
        richText: section.richText,
      };
    case "Post_Pagesections_Sections_ImageBlock":
      return {
        type: "ImageBlock",
        images: (section.images || [])
          .map((it) => imageFm(it.image))
          .filter(Boolean),
      };
    case "Post_Pagesections_Sections_ClientQuote":
      return {
        type: "ClientQuote",
        clientName: section.clientName,
        tagline: section.tagline,
        quote: section.quote,
      };
    default:
      warnings.push(`Unknown section __typename: ${section.__typename}`);
      return null;
  }
}

function transformPage(page) {
  return compactNull({
    title: page.title,
    slug: page.slug,
    date: page.date,
    layout: page.slug?.includes("landing") ? "landing" : "default",
    featuredImage: imageFm(page.featuredImage?.node),
    contentHtml: page.content || "",
  });
}

function transformPost(post) {
  return compactNull({
    title: post.title,
    slug: post.slug,
    date: post.date,
    excerpt: post.excerpt,
    isSticky: post.isSticky || false,
    featuredImage: imageFm(post.featuredImage?.node),
    cardImage: imageFm(post.customImages?.cardImage),
    additionalPostFields: post.additionalPostFields
      ? {
          label: post.additionalPostFields.label,
          brandColor: post.additionalPostFields.brandColor,
          seoDescription: post.additionalPostFields.seoDescription,
        }
      : null,
    services:
      post.services?.nodes?.map((s) => s.slug).filter(Boolean) || [],
    pageSections:
      post.pageSections?.sections?.map(transformSection).filter(Boolean) || [],
    contentHtml: post.content || "",
  });
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const SETTINGS_QUERY = /* GraphQL */ `
  {
    generalSettings {
      title
      description
    }
    readingSettings {
      postsPerPage
    }
  }
`;

const SERVICES_QUERY = /* GraphQL */ `
  {
    services(first: 100) {
      nodes {
        id
        name
        slug
      }
    }
  }
`;

const PAGES_QUERY = /* GraphQL */ `
  {
    pages(first: 100) {
      nodes {
        id
        slug
        title
        date
        content
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
`;

const POSTS_QUERY = /* GraphQL */ `
  {
    posts(first: 100) {
      nodes {
        id
        slug
        title
        excerpt
        content
        date
        isSticky
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        customImages {
          cardImage {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        additionalPostFields {
          label
          brandColor
          seoDescription
        }
        services {
          nodes {
            slug
            name
          }
        }
        pageSections {
          sections {
            __typename
            ... on Post_Pagesections_Sections_MainSection {
              tagline
              title
              background
              richText
            }
            ... on Post_Pagesections_Sections_ImageBlock {
              images {
                image {
                  sourceUrl
                  altText
                  mediaDetails {
                    width
                    height
                  }
                }
              }
            }
            ... on Post_Pagesections_Sections_ClientQuote {
              clientName
              tagline
              quote
            }
          }
        }
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Exporting from ${WPGRAPHQL_URL}`);

  // Wipe previous export to guarantee idempotency.
  await rm(contentDir, { recursive: true, force: true });
  await rm(imagesDir, { recursive: true, force: true });

  // --- Settings + services ---
  const settingsData = await gql(SETTINGS_QUERY);
  const servicesData = await gql(SERVICES_QUERY);

  const settings = {
    siteTitle: settingsData.generalSettings.title,
    siteDescription: settingsData.generalSettings.description,
    postsPerPage: settingsData.readingSettings.postsPerPage,
    gaTrackingId: "G-YPFDS2CY4K", // preserved from gatsby-config.js
  };
  await writeYaml(path.join(contentDir, "settings.yml"), settings);

  const services = servicesData.services.nodes.map((s) => ({
    id: s.slug,
    name: s.name,
  }));
  stats.services = services.length;
  await writeYaml(path.join(contentDir, "services.yml"), services);

  // --- Pages ---
  const pagesData = await gql(PAGES_QUERY);
  for (const p of pagesData.pages.nodes) {
    const fm = transformPage(p);
    await writeMdx(path.join(contentDir, "pages", `${p.slug}.mdx`), fm);
    stats.pages++;
  }

  // --- Posts ---
  const postsData = await gql(POSTS_QUERY);
  for (const p of postsData.posts.nodes) {
    const fm = transformPost(p);
    await writeMdx(path.join(contentDir, "projects", `${p.slug}.mdx`), fm);
    stats.projects++;
  }

  // --- Media download ---
  await downloadAllMedia();

  // --- Migration report ---
  const report = [
    `# Migration report`,
    ``,
    `_Generated ${new Date().toISOString()}_`,
    ``,
    `Source: ${WPGRAPHQL_URL}`,
    ``,
    `## Counts`,
    `- Pages: ${stats.pages}`,
    `- Projects (posts): ${stats.projects}`,
    `- Services: ${stats.services}`,
    `- Unique media: ${mediaRegistry.size}`,
    `- Media downloaded: ${stats.mediaDownloaded}`,
    `- Media skipped (failed): ${stats.mediaSkipped}`,
    ``,
    `## Warnings (${warnings.length})`,
    warnings.length === 0 ? "_(none)_" : warnings.map((w) => `- ${w}`).join("\n"),
    ``,
  ].join("\n");
  await writeFile(path.join(contentDir, "_migration-report.md"), report);

  console.log(`\nDone.`);
  console.log(
    `  Pages: ${stats.pages}   Projects: ${stats.projects}   Services: ${stats.services}`,
  );
  console.log(
    `  Media downloaded: ${stats.mediaDownloaded}   skipped: ${stats.mediaSkipped}`,
  );
  if (warnings.length) {
    console.log(`  Warnings: ${warnings.length} (see content/_migration-report.md)`);
  }
}

main().catch((err) => {
  console.error("\n❌ Export failed:");
  console.error(err);
  process.exit(1);
});
