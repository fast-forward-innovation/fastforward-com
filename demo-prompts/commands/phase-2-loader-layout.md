---
description: Phase 2 — build the typed content loader + root layout + SiteHeader and Footer
---

Build the build-time content loader and root layout:

1. `lib/types.ts` — define typed models: `Project`, `Page`, `FrontmatterImage`, `Service`, `Settings`. `PageSection` is a discriminated union with one variant per block type the Phase 1 export script emits (at minimum `MainSection` / `ImageBlock` / `ClientQuote`; add any others surfaced by the export warnings).
2. `lib/content.ts` — synchronous reads (no async, no fetch). Use `fs.readFileSync` + `gray-matter` + `js-yaml`. Memoise per-process so repeated calls during a build don't re-parse. Exports:
   - `getAllProjects()` — sticky first, then date DESC
   - `getProjectBySlug(slug)`
   - `getAllPages()` / `getPageBySlug(slug)`
   - `getFeaturedProjects(n?)`
   - `getServices()` / `getSettings()`
   - `getPaginatedProjects(page, perPage?)`
3. `lib/trapFocus.ts` — focus-trap helper for the mobile nav (write a small one; it'll be used by SiteHeader in step 5).
4. `app/layout.tsx` — wire Manrope + JetBrains Mono variables onto `<html>`, import globals.css, render `<SiteHeader />` + `<main className="flex-auto">{children}</main>` + `<FooterBlock />`. Generate root metadata via `generateMetadata()` reading `getSettings()` — emit `metadataBase = "<CANONICAL_URL>"`, a title template, the description, Open Graph + Twitter card.
5. `components/SiteHeader.tsx` — `'use client'`. Logo + primary nav + a hamburger button on mobile. Use `usePathname()` to mark the active link. When the mobile menu opens, trap focus inside the menu and trap Tab.
6. `components/footer/Footer.tsx`, `ContactBlock.tsx`, `FooterBlock.tsx` — server components, no client interactivity.
7. Extend `app/globals.css` with base typography rules and any global utilities the header / footer need (e.g. linear-gradient underline on hover).

Run `npm run dev` and confirm the homepage renders with header + footer (even with empty `<main>`) and the active nav link is styled.
