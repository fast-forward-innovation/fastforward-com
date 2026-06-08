---
description: Phase 3 — port all block components, build homepage, our-work listing, and SSG'd project detail
---

Port all block components and the project routes:

1. `components/postBlocks/MainSection.tsx`, `ImageBlock.tsx`, `QuoteBlock.tsx` — one per discriminated variant of `PageSection`. Read frontmatter HTML strings via `dangerouslySetInnerHTML`.
2. `components/page_blocks/ProjectCard.tsx`, `FeaturedProjects.tsx`, `ServiceBlock.tsx`, `TextBlock.tsx` — card grid + service taxonomy display + a text block for home/landing.
3. All images use `next/image` with explicit width + height from frontmatter (no CLS on load). No remote image domains — everything is under `/public`.
4. `components/Post.tsx` — wraps the project detail view: hero (featuredImage) + label + services list + `pageSections.map()` dispatching by `.type` + `<FeaturedProjects />` at the bottom.
5. `components/HomepageBanner.tsx` — `'use client'`. Three rotating hero images (drop placeholder PNGs into `public/hero-images/` for now; the operator can swap them later). `setInterval`-driven crossfade + a CSS-animated underline on a rotating word list.
6. Routes:
   - `app/page.tsx` — homepage: HomepageBanner + a TextBlock + ServiceBlock + FeaturedProjects (top 3).
   - `app/our-work/page.tsx` — full project listing.
   - `app/our-work/[slug]/page.tsx` — single project. `dynamicParams = false`. `generateStaticParams()` returns every project slug. `generateMetadata()` reads `additionalPostFields.seoDescription`.
7. SKIP `/page/[num]` pagination — fewer projects than postsPerPage means it's meaningless. If legacy URLs need handling, we'll add a redirect later.

Run `npm run build`. It should statically generate one route per project plus the index routes, with zero type errors and zero warnings. Report the route count and any warnings.
