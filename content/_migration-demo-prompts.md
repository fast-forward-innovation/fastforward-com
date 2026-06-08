# Live-demo prompts: Gatsby + WordPress → Next.js 16

A sequenced set of prompts to feed into a fresh Claude Code session, one phase at a time. Reproduces the `fastforward-web` → `fastforward-com` port (see `_migration-prompts.md` in this repo for the retrospective) but **stripped of all Pantheon-specific and DNS-cutover work** — the demo targets a live WPGraphQL backend the operator provides and ends at "production build green + locally serving."

## How to use this document

1. Pick an **empty directory** for the new repo. This is your `<TARGET_DIR>`.
2. Open a fresh Claude Code session whose CWD is the **parent** of `<TARGET_DIR>` (so the scaffold step can create the directory).
3. For each phase below, paste the prompt **verbatim** as a single chat message, replacing the `<ANGLE_BRACKETED>` placeholders. Wait for Claude to finish before pasting the next one.
4. Each phase ends with a verification you can run yourself. Don't move on until it's green.

Phases 0–7 are sequential. Visual-QA (the second half of Phase 7) is reactive — paste it only after the build + smoke test in Phase 7a.

---

## Operator prerequisites (substitute before pasting)

| Placeholder | What to provide |
|---|---|
| `<TARGET_DIR>` | Absolute path to the empty directory the new repo will live in, e.g. `/Users/<you>/dev/demo-next-port` |
| `<WP_GRAPHQL_URL>` | Live WPGraphQL endpoint of the source site, e.g. `https://example.com/graphql` |
| `<SITE_TITLE>` | Display title for the new site (used in `<title>` template + OG tags) |
| `<SITE_DESCRIPTION>` | One-sentence site description (used in meta description + OG) |
| `<CANONICAL_URL>` | Production canonical URL, e.g. `https://www.example.com` — used in sitemap / robots / OG |
| `<GA_TRACKING_ID>` | Optional. Google Analytics 4 tracking id like `G-XXXXXXXXXX`. Set to `""` to skip GA. |
| `<MONDAY_BOARD_ID>` | Optional. If the source site posts contact-form leads to Monday.com, supply the numeric board id. Leave blank to scaffold a no-op echo handler in Phase 5. |

Two **technical preconditions** worth confirming before you start:
- Node 20+ (`node --version`).
- The WPGraphQL endpoint actually responds to `{ generalSettings { title } }` (a quick curl proves connectivity). If it doesn't, Phase 1 will fail noisily.

---

## Phase 0 prompt — Scaffold + configure

```
Scaffold a fresh Next.js 16 site at <TARGET_DIR>:

1. cd into <TARGET_DIR>'s parent and run:
   npx create-next-app@latest <basename of TARGET_DIR> \
     --app --typescript --tailwind --src-dir=false --eslint --import-alias "@/*"
2. Add "engines": { "node": ">=20" } to package.json.
3. Swap the scaffold's fonts for next/font/google: Manrope (variable, --font-manrope)
   and JetBrains Mono (--font-mono). Wire both onto <html className> in app/layout.tsx.
4. In Tailwind 4 the theme lives as CSS custom properties inside @theme { … } in
   app/globals.css — there is no tailwind.config.ts. Port the source site's primary
   palette and any custom container width as --color-* and --container-* variables
   inside that block. If you don't know the palette yet, use neutral placeholders
   we'll refine after the export.
5. Confirm `npm run dev` serves a blank page with the chosen fonts and Tailwind
   classes working. Throttle the network in DevTools and reload — confirm no font
   swap reflow (next/font's size-adjust fallback metrics handle this).

Important gotcha to be aware of going forward: in Tailwind 4, any custom class
used with a responsive prefix (lg:, max-lg:, etc.) MUST be declared via @utility
at the bottom of globals.css, not inside @layer components/utilities/base — layer
classes silently fail to participate in the responsive variant system.

Don't write a CLAUDE.md or commit yet. Just get the dev server up.
```

**Verification:** `npm run dev` serves at http://localhost:3000 with no console errors; reload with throttling on and the page renders with the right font on first paint.

---

## Phase 1 prompt — Content export from WordPress

```
Write scripts/export-wp-to-markdown.mjs in this repo to do a one-shot export
from <WP_GRAPHQL_URL>. The script must:

1. Introspect the WP schema first to confirm:
   - allWpPage, allWpPost queries available (post type used for projects).
   - The ACF flexible-content union for project pageSections. Whatever block
     layouts exist on the live site, the script must enumerate them and warn
     loudly if it sees one it doesn't know how to map.
   - generalSettings + readingSettings + the services taxonomy (post tags or
     a custom taxonomy named services).
2. For each WP page → write content/pages/{slug}.mdx with full frontmatter
   (title, slug, date, layout, featuredImage if any, contentHtml as a raw
   string for dangerouslySetInnerHTML).
3. For each WP post → write content/projects/{slug}.mdx with frontmatter:
   title, slug, date, excerpt, isSticky, featuredImage, cardImage,
   additionalPostFields (label, brandColor, seoDescription), services
   (array of slugs), and pageSections (typed discriminated union — each
   entry has a 'type' field matching the WP layout name).
4. Download every referenced media item into public/content/images/YYYY/MM/.
   Record intrinsic width + height in frontmatter using image-size (sync,
   no network) so next/image can serve without CLS.
5. Handle BOTH /app/uploads/ (Pantheon WP) and /wp-content/uploads/ (stock WP)
   upload path prefixes when rewriting image URLs to local paths.
6. Write content/services.yml (id + name per service) and content/settings.yml
   (siteTitle, siteDescription, postsPerPage, gaTrackingId — use <SITE_TITLE>,
   <SITE_DESCRIPTION>, 10, "<GA_TRACKING_ID>").
7. End by writing content/_migration-report.md with counts of pages, projects,
   services, unique media, downloaded media, skipped media, and a warnings list.
8. Be idempotent: wipe content/ and public/content/images/ at the start of
   each run.

Install gray-matter, js-yaml, and image-size as dev deps. Then run the script
once. Report the counts from _migration-report.md when done.
```

**Verification:** `content/projects/*.mdx`, `content/pages/*.mdx`, `content/services.yml`, `content/settings.yml`, and `content/_migration-report.md` all exist. Spot-check one project file's frontmatter against the live WP page — title, services, and featured image URL should match.

---

## Phase 2 prompt — Typed loader + root layout

```
Build the build-time content loader and root layout:

1. lib/types.ts — define typed models: Project, Page, FrontmatterImage, Service,
   Settings. PageSection is a discriminated union with one variant per block
   type the Phase 1 export script emits (at minimum MainSection / ImageBlock /
   ClientQuote; add any others surfaced by the export warnings).
2. lib/content.ts — synchronous reads (no async, no fetch). Use fs.readFileSync
   + gray-matter + js-yaml. Memoise per-process so repeated calls during a build
   don't re-parse. Exports:
   - getAllProjects()           // sticky first, then date DESC
   - getProjectBySlug(slug)
   - getAllPages() / getPageBySlug(slug)
   - getFeaturedProjects(n?)
   - getServices() / getSettings()
   - getPaginatedProjects(page, perPage?)
3. lib/trapFocus.ts — focus-trap helper for the mobile nav (write a small one;
   it'll be used by SiteHeader in step 5).
4. app/layout.tsx — wire Manrope + JetBrains Mono variables onto <html>, import
   globals.css, render <SiteHeader /> + <main className="flex-auto">{children}</main>
   + <FooterBlock />. Generate root metadata via generateMetadata() reading
   getSettings() — emit metadataBase = "<CANONICAL_URL>", a title template, the
   description, Open Graph + Twitter card.
5. components/SiteHeader.tsx — 'use client'. Logo + primary nav + a hamburger
   button on mobile. Use usePathname() to mark the active link. When the mobile
   menu opens, trap focus inside the menu and trap Tab.
6. components/footer/Footer.tsx, ContactBlock.tsx, FooterBlock.tsx — server
   components, no client interactivity.
7. Extend app/globals.css with base typography rules and any global utilities
   the header / footer need (e.g. linear-gradient underline on hover).

Run `npm run dev` and confirm the homepage renders with header + footer (even
with empty <main>) and the active nav link is styled.
```

**Verification:** Header + footer render at `/`. The nav highlights based on URL. Mobile breakpoint shows hamburger; tapping it opens the menu and focus is trapped.

---

## Phase 3 prompt — Homepage, our-work, and block components

```
Port all block components and the project routes:

1. components/postBlocks/MainSection.tsx, ImageBlock.tsx, QuoteBlock.tsx — one
   per discriminated variant of PageSection. Read frontmatter HTML strings
   via dangerouslySetInnerHTML.
2. components/page_blocks/ProjectCard.tsx, FeaturedProjects.tsx, ServiceBlock.tsx,
   TextBlock.tsx — card grid + service taxonomy display + a text block for
   home/landing.
3. All images use next/image with explicit width + height from frontmatter
   (no CLS on load). No remote image domains — everything is under /public.
4. components/Post.tsx — wraps the project detail view: hero (featuredImage) +
   label + services list + pageSections.map() dispatching by .type +
   <FeaturedProjects /> at the bottom.
5. components/HomepageBanner.tsx — 'use client'. Three rotating hero images
   (drop placeholder PNGs into public/hero-images/ for now; the operator can
   swap them later). setInterval-driven crossfade + a CSS-animated underline
   on a rotating word list.
6. Routes:
   - app/page.tsx — homepage: HomepageBanner + a TextBlock + ServiceBlock +
     FeaturedProjects (top 3).
   - app/our-work/page.tsx — full project listing.
   - app/our-work/[slug]/page.tsx — single project. dynamicParams = false.
     generateStaticParams() returns every project slug. generateMetadata()
     reads additionalPostFields.seoDescription.
7. SKIP /page/[num] pagination — fewer projects than postsPerPage means it's
   meaningless. If legacy URLs need handling, we'll add a redirect later.

Run `npm run build`. It should statically generate one route per project
plus the index routes, with zero type errors and zero warnings.
```

**Verification:** `npm run build` succeeds. `npm run start` then `curl http://localhost:3000/our-work` returns HTML with all project titles. `/our-work/<any-slug>` renders the full hero + blocks.

---

## Phase 4 prompt — Dynamic pages + contact + 404

```
Add the remaining routes:

1. app/[slug]/page.tsx — dynamic catch-all for WP pages. dynamicParams = false,
   generateStaticParams() returns every getAllPages() slug. Dispatch by
   frontmatter `layout`: "landing" → <LandingPage />, anything else → <Page />.
2. components/Page.tsx — simple wrapper: title + featuredImage + contentHtml
   (via dangerouslySetInnerHTML).
3. components/LandingPage.tsx — hero + feature grid (read from frontmatter
   features array, default empty) + WP content + FeaturedProjects bottom.
4. app/contact-us/page.tsx — static heading + address block + a <ContactForm />
   placeholder (real form lands in Phase 5).
5. app/contact-submitted/page.tsx — reads searchParams.success and shows a
   success / failure message. Mark robots noindex.
6. app/not-found.tsx — clean 404.

`npm run build` should now produce more routes — at least one per WP page,
plus contact-us, contact-submitted, and the 404.
```

**Verification:** Hit `/<any-page-slug>` via `npm run start`. The right template renders. `/this-slug-does-not-exist` returns 404. `/contact-submitted?success=true` shows the success state.

---

## Phase 5 prompt — Contact form + form backend route

```
Port the contact form and stand up its API route.

1. app/api/contact/route.ts — POST handler. Validates payload (matching the
   client-side rules from step 2), sanitizes string inputs (strip HTML tags,
   collapse newlines to spaces), then:

   Option A — if <MONDAY_BOARD_ID> was provided:
     Forward to Monday.com via GraphQL. Use VARIABLES to pass column_values,
     not inline JSON escaping. Endpoint: https://api.monday.com/v2/. Headers:
     Content-Type: application/json, API-Version: 2023-10, Authorization:
     process.env.MONDAY_API_TOKEN. Board: <MONDAY_BOARD_ID>. Return 500 with
     a clear error JSON if MONDAY_API_TOKEN isn't set; 400 on bad input;
     502 on Monday errors; 200 on success.

   Option B — if <MONDAY_BOARD_ID> is blank:
     Stand up a no-op echo route that console.error('contact form submission:',
     payload) and returns { success: true } — no external dependency. Add a
     short README comment in the route explaining how to swap to a real backend.

2. components/ContactForm.tsx — 'use client'. Standard fields: firstName,
   lastName, company, website, email, three-input grouped phone, comments.
   Client-side validation with inline error display. router.push() to
   /contact-submitted?success={true|false} based on the API response.
3. Wire <ContactForm /> into app/contact-us/page.tsx (replacing the placeholder
   from Phase 4).
4. Add .env.local.example documenting MONDAY_API_TOKEN (omit if Option B is in
   play) and NEXT_PUBLIC_SITE_URL=<CANONICAL_URL>. Confirm .env.local is
   gitignored.

Run `npm run dev` and submit the form once. In Option A, confirm the row lands
in Monday (have the operator check). In Option B, confirm the payload appears
in the terminal log.
```

**Verification:** Form renders, validation works, submission redirects to `/contact-submitted?success=true`. Option A: row in Monday. Option B: payload logged.

---

## Phase 6 prompt — SEO, sitemap, robots, manifest, analytics

```
Full SEO + crawlability pass:

1. Root app/layout.tsx generateMetadata() — extend with Open Graph and Twitter
   card (already partially done in Phase 2). All values come from
   getSettings() — metadataBase = "<CANONICAL_URL>".
2. Each project page's generateMetadata() reads
   additionalPostFields.seoDescription if present, else falls back to excerpt.
3. app/sitemap.ts — enumerate: homepage, /our-work, /contact-us, every project
   detail, every dynamic WP page. Per-project lastModified from the project's
   date frontmatter.
4. app/robots.ts — allow everything except /contact-submitted and /api/.
   Reference the sitemap URL.
5. app/manifest.ts — short_name, name, description, start_url = "/", display
   = "minimal-ui", theme_color and background_color from the brand palette
   (use the primary --color- variable from globals.css), icons referencing
   app/icon.png.
6. Google Analytics — only if <GA_TRACKING_ID> is non-empty. Add
   @next/third-parties/google as a dep, mount <GoogleAnalytics gaId={…} /> in
   the root layout reading from getSettings().gaTrackingId. If the id is empty,
   render nothing.

`npm run build` should now include sitemap.xml, robots.txt, and
manifest.webmanifest in the route list.
```

**Verification:** `curl http://localhost:3000/sitemap.xml` enumerates all routes. `curl /robots.txt` disallows `/contact-submitted` and `/api/`. View source on `/` and confirm OG + Twitter meta tags are present. If GA is configured, the gtag script tag is in the HTML.

---

## Phase 7a prompt — Pre-flight + build green

```
Pre-launch cleanup:

1. Replace the create-next-app README with a real one: project overview,
   `npm run dev` / `npm run build` quickstart, content-editing notes (how
   to add a project, how to add a static page), env-var table.
2. Add a permanent redirect in next.config.ts from /page/:num to / (catches
   any legacy Gatsby pagination URLs if the source site had them indexed).
3. Next 16 requires an explicit images.qualities allowlist when any next/image
   uses a non-default quality. If HomepageBanner or any landing-page image
   uses quality={90}, add images: { qualities: [75, 90] } to next.config.ts.
4. Confirm .env.local is gitignored; .env.local.example is committed.
5. `npm run build`. Zero warnings, all routes statically generated except the
   contact-form POST and /contact-submitted (which reads searchParams).

After build is green, run `npm run start` and curl every route generated by
sitemap.xml. Each must return 200. Report any 4xx/5xx.
```

**Verification:** Build green, every sitemap route returns 200 on `npm run start`. README opens cleanly on GitHub-style preview (or VS Code preview).

---

## Phase 7b prompt — Visual QA + reactive fix pass

> Paste this **after** 7a is green and you've opened the site in a browser.

```
Visual QA pass. Side-by-side the new site against the source WordPress site
in two browser windows. Walk every route and look specifically for the
following categories of regression — these are the bugs that bit the original
migration in 2026-04-17:

1. Desktop logo missing or hamburger on the wrong side: in Tailwind 4, custom
   classes defined inside @layer base/components/utilities do NOT participate
   in responsive prefixes. lg:my-custom-class silently no-ops. If the desktop
   nav layout is broken, move the offending custom classes from @layer to
   @utility at-rules.
2. Featured image clipping on the right edge of project detail pages: if
   <img className="w-full lg:mx-6"> the horizontal margin pushes the image
   beyond its container. Move the gutter to the wrapping element as px-6,
   not mx-6.
3. White rubber-band peek above the fixed header when overscrolling on
   macOS: add `overscroll-behavior-y: none` on html in globals.css.
4. CTA buttons rendering on a white instead of gradient background at the
   lg: breakpoint: same Tailwind 4 trap as #1 — move the gradient utility
   to an @utility at-rule.
5. Gradient button hover transition snapping instead of fading: register the
   gradient color stops as @property --gradient1..4 with syntax: "<color>"
   and transition the properties (not the background-image).
6. Favicon defaulting to Next's: place app/icon.png and delete any stale
   app/favicon.ico — the App Router file convention takes precedence.

Apply each fix as you find the symptom. Don't fix what isn't broken. After
the pass, run `npm run build` again and re-curl every sitemap route.
```

**Verification:** Side-by-side visual parity with the source site. `npm run build` still green.

---

## Phase 7c prompt — Deploy to a real host (no Pantheon)

```
Deploy to <PRODUCTION_TARGET>. Default if unspecified: Vercel.

1. Initialize a git repo if not already (git init && git add . && git commit
   -m "Initial port").
2. Push to a fresh GitHub repo (operator creates it on github.com; provide
   the SSH or HTTPS URL).
3. Connect the repo to Vercel (`npx vercel link` + `npx vercel`). Confirm
   the build runs on Vercel's side and the preview URL serves correctly.
4. Set environment variables on the Vercel project (Production scope):
   - MONDAY_API_TOKEN (if Phase 5 was Option A; otherwise skip).
   - NEXT_PUBLIC_SITE_URL = <CANONICAL_URL> (so sitemap.xml / robots.txt
     reference the real domain).
5. `npx vercel --prod` and confirm the production URL returns the same routes
   that local `npm run start` did.

Skip DNS for the demo — leave the site at the Vercel-assigned URL. The
operator can cut DNS over to it later.
```

**Verification:** Vercel production URL returns the homepage; `curl <url>/sitemap.xml` enumerates the routes. The contact form submission either lands in Monday (Option A) or logs in Vercel's runtime logs (Option B).

---

## Notes for the operator

- **Pace.** If you paste all prompts back-to-back without verification, you'll hit a bug late and won't know which phase caused it. One phase at a time.
- **Phase 0 + 1 took roughly an hour in the original run — most of it spent on the export script's WP introspection.** Subsequent phases were ~30 minutes each. Phase 7 reactive QA is hard to time-box because it's bug-driven; budget a full second session for it.
- **The Tailwind 4 responsive-prefix trap is the single most likely thing to go wrong.** If anything looks visually off at the `lg:` breakpoint, suspect a custom class defined in `@layer …` rather than `@utility`.
- **Re-running the Phase 1 export script wipes `content/` and `public/content/images/`.** Hand-edits to those files are erased. Useful while the WP backend is still live; risky once you start editing locally.
