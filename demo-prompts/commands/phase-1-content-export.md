---
description: Phase 1 — write and run the one-shot WordPress → markdown/YAML content export script
---

Write `scripts/export-wp-to-markdown.mjs` in this repo to do a one-shot export from <WP_GRAPHQL_URL>. The script must:

1. Introspect the WP schema first to confirm:
   - `allWpPage`, `allWpPost` queries available (post type used for projects).
   - The ACF flexible-content union for project `pageSections`. Whatever block layouts exist on the live site, the script must enumerate them and warn loudly if it sees one it doesn't know how to map.
   - `generalSettings` + `readingSettings` + the services taxonomy (post tags or a custom taxonomy named `services`).
2. For each WP page → write `content/pages/{slug}.mdx` with full frontmatter (title, slug, date, layout, featuredImage if any, contentHtml as a raw string for dangerouslySetInnerHTML).
3. For each WP post → write `content/projects/{slug}.mdx` with frontmatter: title, slug, date, excerpt, isSticky, featuredImage, cardImage, additionalPostFields (label, brandColor, seoDescription), services (array of slugs), and pageSections (typed discriminated union — each entry has a `type` field matching the WP layout name).
4. Download every referenced media item into `public/content/images/YYYY/MM/`. Record intrinsic width + height in frontmatter using `image-size` (sync, no network) so `next/image` can serve without CLS.
5. Handle BOTH `/app/uploads/` (Pantheon WP) and `/wp-content/uploads/` (stock WP) upload path prefixes when rewriting image URLs to local paths.
6. Write `content/services.yml` (id + name per service) and `content/settings.yml` (siteTitle, siteDescription, postsPerPage, gaTrackingId — use "<SITE_TITLE>", "<SITE_DESCRIPTION>", 10, "<GA_TRACKING_ID>").
7. End by writing `content/_migration-report.md` with counts of pages, projects, services, unique media, downloaded media, skipped media, and a warnings list.
8. Be idempotent: wipe `content/` and `public/content/images/` at the start of each run.

Install `gray-matter`, `js-yaml`, and `image-size` as dev deps. Then run the script once. Report the counts from `_migration-report.md` when done.
