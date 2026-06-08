---
description: Phase 6 — Open Graph metadata, sitemap, robots, manifest, and Google Analytics
---

Full SEO + crawlability pass:

1. Root `app/layout.tsx` `generateMetadata()` — extend with Open Graph and Twitter card (already partially done in Phase 2). All values come from `getSettings()` — `metadataBase = "<CANONICAL_URL>"`.
2. Each project page's `generateMetadata()` reads `additionalPostFields.seoDescription` if present, else falls back to `excerpt`.
3. `app/sitemap.ts` — enumerate: homepage, `/our-work`, `/contact-us`, every project detail, every dynamic WP page. Per-project `lastModified` from the project's `date` frontmatter.
4. `app/robots.ts` — allow everything except `/contact-submitted` and `/api/`. Reference the sitemap URL.
5. `app/manifest.ts` — `short_name`, `name`, `description`, `start_url = "/"`, `display = "minimal-ui"`, `theme_color` and `background_color` from the brand palette (use the primary `--color-` variable from globals.css), `icons` referencing `app/icon.png`.
6. Google Analytics — only if `<GA_TRACKING_ID>` is non-empty. Add `@next/third-parties/google` as a dep, mount `<GoogleAnalytics gaId={…} />` in the root layout reading from `getSettings().gaTrackingId`. If the id is empty, render nothing.

`npm run build` should now include `sitemap.xml`, `robots.txt`, and `manifest.webmanifest` in the route list. After build, `curl http://localhost:3000/sitemap.xml` should enumerate every route — report the count.
