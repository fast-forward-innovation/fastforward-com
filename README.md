# fastforward-com

Production website for **Fast Forward** (fastforward.sh). Ported from a Gatsby 4 + headless WordPress setup to a Next.js 16 static site with no runtime CMS — content is plain markdown/YAML in this repo.

- **Framework:** Next.js 16 (App Router) · React 19 · TypeScript
- **Styling:** Tailwind 4 (CSS-first config in `app/globals.css`)
- **Fonts:** `next/font/google` — Manrope + JetBrains Mono, with `size-adjust` fallback metrics so no font-swap layout shift
- **Hosting:** Pantheon Next.js (GitHub-sourced, containerized Node)
- **Content:** `content/*.mdx` + `content/*.yml` at repo root — edit in an editor, commit, push
- **Form backend:** `app/api/contact/route.ts` — Next.js API route that forwards to a Monday.com Leads board

Quick links: [Pantheon Next.js docs](https://docs.pantheon.io/nextjs) · [Next.js App Router docs](https://nextjs.org/docs/app)

---

## Table of contents

- [Architecture](#architecture)
- [Local development](#local-development)
- [Editing content](#editing-content)
- [Deployment (Dev / Test / Live)](#deployment-dev--test--live)
- [Environment variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Project layout](#project-layout)
- [Migration history](#migration-history)

---

## Architecture

### Rendering model
All site pages are **statically generated at build time**. Next.js walks each route, calls `generateStaticParams` where relevant, and writes HTML to disk. At runtime Pantheon serves those HTML files from its CDN + persistent cache. The only non-static routes are:

- `app/api/contact/route.ts` — POST handler; server-rendered on demand
- `app/contact-submitted/page.tsx` — reads `searchParams.success`, server-rendered on demand

Everything else (`/`, `/our-work`, `/our-work/[slug]`, `/[slug]`, `/contact-us`, plus `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, `icon.png`) is prerendered.

### Content loader
Content lives in files under `content/`. At build time `lib/content.ts` reads them synchronously with `gray-matter` + `js-yaml` and returns typed objects:

```ts
import { getAllProjects, getProjectBySlug, getSettings } from "@/lib/content";

const project = getProjectBySlug("mfa-enhancing-museum-experience");
// → fully typed Project (see lib/types.ts)
```

Pages reference the loader directly — no database, no fetch, no runtime I/O. The loader memoises results so repeated calls during a build don't re-parse.

### Block rendering
Each project's `pageSections` frontmatter is an array of discriminated blocks. [components/Post.tsx](components/Post.tsx) maps over them and dispatches by `type`:

```tsx
{pageSections.map((s, i) => {
  if (s.type === "MainSection") return <MainSection key={i} section={s} mainCount={...} />
  if (s.type === "ImageBlock")  return <ImageBlock  key={i} block={s} />
  if (s.type === "ClientQuote") return <QuoteBlock  key={i} section={s} />
})}
```

To add a new block type: extend the `PageSection` union in [lib/types.ts](lib/types.ts), update the export script if you still use it, and add a render case in `Post.tsx`.

### Styling (Tailwind 4)
Tailwind 4 changed how theming works — there's no `tailwind.config.ts`. The theme (custom colors, font vars, type scale, container widths) is declared via CSS custom properties in a `@theme { … }` block at the top of [app/globals.css](app/globals.css). Custom utilities live in `@utility` at-rules at the bottom of the same file.

**Gotcha worth knowing:** a custom class you want to use with a responsive prefix (e.g. `lg:my-class`) MUST be declared via `@utility`, not `@layer components/utilities/base`. Layer-defined classes will silently not generate responsive variants — the class just won't exist at `lg:`. See commits `ea5db68` and `2f16f05` for examples.

### SEO + metadata
- Root metadata + Open Graph + Twitter card in [app/layout.tsx](app/layout.tsx) `generateMetadata` — reads `content/settings.yml`
- Per-route metadata in each page's `generateMetadata` (project pages read `additionalPostFields.seoDescription`)
- [app/sitemap.ts](app/sitemap.ts), [app/robots.ts](app/robots.ts), [app/manifest.ts](app/manifest.ts) generate their respective files automatically
- Google Analytics via `@next/third-parties/google` — tracking id comes from `content/settings.yml`

### Images
Everything uses `next/image` with explicit `width` + `height` from the migrated WP `mediaDetails`. No CLS on load. Static heroes (`public/hero-images/`) are imported directly so Next bundles them. There are no remote image domains — everything is under `public/`.

---

## Local development

### One-time setup

1. Use the right Node version (20+):
   ```bash
   nvm use       # reads .nvmrc… actually we don't have one, but package.json engines says >=20
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your local env file:
   ```bash
   cp .env.local.example .env.local
   ```
   Open `.env.local` and paste your `MONDAY_API_TOKEN` after the `=`. (Get a personal token from https://monday.com → Admin → Developers → Tokens. Board id `3979078971` needs write access.)

### Daily workflow

```bash
npm run dev       # http://localhost:3000, hot reload
```

Environment variables are read at server start — if you change `.env.local`, restart `npm run dev`.

### Scripts

| Script            | What it does                                         |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Dev server with Turbopack + HMR                      |
| `npm run build`   | Production build (the exact build Pantheon runs)     |
| `npm run start`   | Serve the built app locally (for testing the prod bundle) |
| `npm run lint`    | ESLint (Next.js flat config)                         |

**Before pushing**, it's worth running `npm run build` locally — it's what Pantheon will run, and it catches type errors + route-generation issues that `npm run dev` will let through.

---

## Editing content

### To add a project (case study)

1. Create `content/projects/<slug>.mdx`. Frontmatter schema is in [lib/types.ts](lib/types.ts) (`Project` interface). Minimum:
   ```yaml
   ---
   title: "My Project"
   slug: "my-project"
   date: "2026-04-18T00:00:00"
   excerpt: ""
   isSticky: false
   featuredImage:
     src: /content/images/2026/04/hero.jpg
     alt: "Description of the image"
     width: 1600
     height: 900
   services: ["design", "development"]   # slugs from content/services.yml
   pageSections: []
   ---
   ```
2. Drop images under `public/content/images/YYYY/MM/`. Always include `width` and `height` in frontmatter (prevents layout shift).
3. Build blocks in the `pageSections` array. See an existing project for examples:
   - `MainSection` — rich text with a title, tagline, and background
   - `ImageBlock` — one or two side-by-side images
   - `ClientQuote` — customer quote with attribution

### To add a static page

Drop an `.mdx` in `content/pages/`. `layout: "default"` for a standard article; `layout: "landing"` for the hero+features landing-page template.

### To adjust site-wide settings

- `content/settings.yml` — site title, description, posts-per-page, GA tracking id
- `content/services.yml` — service taxonomy (slugs referenced by projects)

### When you push

Pantheon's Dev environment rebuilds automatically from `main`. See next section for promoting to Test / Live.

---

## Deployment (Dev / Test / Live)

Pantheon's Next.js hosting uses the same **Dev → Test → Live** three-environment model as their WordPress product, driven by GitHub.

### Dev

Every push to the `main` branch on GitHub auto-deploys to the **Dev** environment:

```
https://dev-fastforward.pantheonsite.io/
```

Turnaround is usually 1–3 minutes. Watch the build in the Pantheon dashboard.

### Test

Push a git **tag** matching `pantheon_test_*` at the commit you want to promote. Example:

```bash
git tag -a pantheon_test_$(date +%Y%m%d) -m "Promote to Test"
git push origin pantheon_test_$(date +%Y%m%d)
```

This creates/updates the Test environment, usually at `test-fastforward.pantheonsite.io`. Run your QA pass there.

### Live

Same pattern with the `pantheon_live_*` prefix:

```bash
git tag -a pantheon_live_$(date +%Y%m%d) -m "Promote to Live"
git push origin pantheon_live_$(date +%Y%m%d)
```

Live is at `live-fastforward.pantheonsite.io` before DNS cutover, and at `fastforward.sh` (apex; `www` 301-redirects to apex) once the domain points here.

### Typical release flow

1. Work on a feature branch → open PR → merge to `main`
2. Pantheon auto-deploys `main` to Dev. QA there.
3. When Dev is green, tag `pantheon_test_<date>` at that commit and push. QA on Test.
4. When Test is green, tag `pantheon_live_<date>` and push. Live updates.

### Secrets Manager

Env vars for each Pantheon environment are managed in **Secrets Manager** in the Pantheon dashboard (not via `.env` files at runtime). At minimum:

- `MONDAY_API_TOKEN` — required wherever the contact form needs to work (typically all three environments).
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile credentials for contact-form bot protection. Required on every deployed environment; the server *skips* verification if the secret is absent (local-dev parity), but production must have both set or the form is wide open to bots. Get them from Cloudflare dashboard → Turnstile.
- `PCC_SITE_ID`, `PCC_TOKEN` — required wherever Lab Project pages from Pantheon Content Publisher should render (any env that's serving the public site).
- `PCC_WEBHOOK_SECRET` — required on Live (and any env you want to receive PCC webhook calls). Must match the `?token=` query string in the webhook URL configured in PCC's dashboard.

Optional:
- `ANTHROPIC_API_KEY` — enables Claude-based inquiry classification on `/api/contact`. Submissions get tagged `business` / `job` / `sales_pitch` / `support` / `other` so the leads board can be filtered. When unset, submissions go through untagged (logged warning). Uses Claude Haiku 4.5 — roughly $0.001–0.01 per submission.
- `MONDAY_INQUIRY_TYPE_COLUMN_ID` — Monday **Dropdown**-column ID where the classifier writes the tag (route writes a single-label dropdown value; if you switch the column to Status, update the column-write shape in [app/api/contact/route.ts](app/api/contact/route.ts)). When unset, the tag is prepended to the comments column as `[Type: <category>]` instead. To find the ID, run `curl -s -X POST https://api.monday.com/v2 -H "Authorization: $MONDAY_API_TOKEN" -H "Content-Type: application/json" -d '{"query":"query { boards(ids: [3979078971]) { columns { id title type } } }"}' | python3 -m json.tool` and grep for the column title.
- `NEXT_PUBLIC_SITE_URL` — defaults to `https://fastforward.sh` (the canonical apex; the server canonicalizes `www` → apex). Override per-environment only if the production domain changes.

**Configure all PCC secrets with `Secret Type: Environment` and `Scopes: Job + Web`** (both checked). Despite the dialog text mentioning "Integrated Composer builds", Environment is the type that surfaces secrets as `process.env.X` for Next.js — Runtime-type secrets do not. Pantheon's UI does not allow changing Type after creation; if you pick wrong, delete and recreate. Trigger a redeploy on the env after changes to apply.

### Caching on Pantheon

Pantheon's traditional cache automation (`pantheon.yml` Quicksilver hooks, `terminus env:clear-cache` via PHP scripts) **is not supported on the Next.js platform** — the `pantheon.yml` file is silently ignored. Instead, this site uses Pantheon's official [`@pantheon-systems/nextjs-cache-handler`](https://github.com/pantheon-systems/nextjs-cache-handler), wired up as Next's `cacheHandler` in [next.config.ts](next.config.ts) and exported from [cacheHandler.mjs](cacheHandler.mjs).

What it does for us:
- **Build-aware route cache.** On every new deploy the handler detects the new build ID and invalidates the Full Route Cache. This is what stops the "post-deploy multidev serves stale HTML referencing old `/_next/static/<hash>.css` paths until I click Clear Caches" failure mode.
- **Edge purges on `revalidateTag` / `revalidatePath`.** Pantheon sets `OUTBOUND_PROXY_ENDPOINT` on every environment; the handler uses it to purge the CDN whenever cache tags are invalidated server-side. The PCC revalidate webhook at [/api/revalidate](app/api/revalidate/route.ts) goes through this path.
- **Shared GCS-backed cache across containers.** On Pantheon, `CACHE_BUCKET` is set and the handler stores entries in Google Cloud Storage so every container sees the same cache. Locally `CACHE_BUCKET` is unset and the handler falls back to file-based caching — same code, no setup required.

The handler is configured with `type: "auto"`, so the GCS-vs-file decision is environment-driven and there's nothing to flip per-env.

For deeper reference: [Pantheon Next.js Considerations](https://docs.pantheon.io/nextjs/considerations) (notes the Quicksilver/`pantheon.yml` gap), [Caching Recommendations for Front-End Sites](https://docs.pantheon.io/guides/decoupled/wp-nextjs-frontend-starters/caching), and the [`nextjs-cache-handler` README](https://github.com/pantheon-systems/nextjs-cache-handler).

---

## Environment variables

See [.env.local.example](.env.local.example) for the canonical list and docs.

| Variable                          | Where                                 | Purpose                                                                  |
| --------------------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `MONDAY_API_TOKEN`                | local `.env.local` + Pantheon Secrets | Contact-form route authenticates to Monday.com with this                 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`  | local `.env.local` + Pantheon Secrets | Cloudflare Turnstile public key — gates the contact form's submit button |
| `TURNSTILE_SECRET_KEY`            | local `.env.local` + Pantheon Secrets | Cloudflare Turnstile secret — server-side token verification             |
| `ANTHROPIC_API_KEY`               | Pantheon Secrets (optional)           | Enables Claude-based inquiry classification on `/api/contact`            |
| `MONDAY_INQUIRY_TYPE_COLUMN_ID`   | Pantheon Secrets (optional)           | Monday Dropdown-column ID for the inquiry-type tag                       |
| `NEXT_PUBLIC_SITE_URL`            | Pantheon Secrets (optional)           | Overrides the canonical URL in sitemap.xml, robots.txt, and OpenGraph    |

---

## Troubleshooting

### `ChunkLoadError` / 404 on `_next/static/chunks/*.js` after deploy
Should be rare now that the Pantheon cache handler (see [Caching on Pantheon](#caching-on-pantheon)) invalidates the Full Route Cache on every new build ID. If it does happen — usually a fluke where a request lands during the deploy window — hit **Clear Caches** on the environment in the Pantheon dashboard (or `terminus env:clear-cache fastforward-com.<env>`) and refresh.

### Contact form returns 500 "Server misconfigured"
`MONDAY_API_TOKEN` isn't set (or wasn't read). For local: check `.env.local` has the token and restart `npm run dev`. For Pantheon: check the env's Secrets Manager.

### Pantheon build fails with a Node version error
Make sure `package.json` `engines.node` is still `>=20`. Pantheon picks from that.

### SEO score 58 on Lighthouse
You're running against a Pantheon non-Live environment. Pantheon overrides `robots.txt` with `Disallow: /` and adds `X-Robots-Tag: noindex` on Dev/Test to prevent accidental indexing. On Live it goes away. Not a code issue.

---

## Project layout

```
app/                          App Router routes
  layout.tsx                  Root layout: fonts, metadata, SiteHeader, FooterBlock, GA
  page.tsx                    Homepage
  [slug]/page.tsx             Dynamic WP-style static pages (privacy-policy, accessibility)
  our-work/
    page.tsx                  Projects listing
    [slug]/page.tsx           Individual project detail (SSG per slug)
  contact-us/page.tsx         Contact page
  contact-submitted/page.tsx  Post-submit landing (reads ?success=)
  api/contact/route.ts        POST handler → Monday.com
  fonts.ts                    next/font declarations
  globals.css                 Tailwind @import + @theme + @layer + @utility
  sitemap.ts robots.ts manifest.ts icon.png
components/                   All .tsx, mix of server + 'use client'
  SiteHeader.tsx              Client-side menu state + focus trap
  HomepageBanner.tsx          Client — rotating heroes + animated words
  ContactForm.tsx             Client — client-side validation, POSTs to /api/contact
  Post.tsx Page.tsx LandingPage.tsx
  page_blocks/                ProjectCard, FeaturedProjects, ServiceBlock, TextBlock
  postBlocks/                 MainSection, ImageBlock, QuoteBlock
  footer/                     Footer, ContactBlock, FooterBlock
lib/
  content.ts                  Typed content loader (gray-matter + js-yaml)
  types.ts                    Project, Page, PageSection union, Service, Settings
  trapFocus.ts                Focus-trap helper used by SiteHeader
content/
  projects/*.mdx              One file per case study
  pages/*.mdx                 privacy-policy.mdx, accessibility.mdx
  services.yml                Service taxonomy
  settings.yml                Site title, description, GA id, postsPerPage
public/
  content/images/YYYY/MM/     Migrated WP media (~140 MB)
  hero-images/                Homepage rotating heroes
  *.svg, icon.png, etc.       Static assets
scripts/
  export-wp-to-markdown.mjs   One-shot WP → markdown exporter (kept for re-runs
                              against the old WP backend while it's still alive)
next.config.ts                Image qualities, /page/:num → / redirect
package.json tsconfig.json eslint.config.mjs postcss.config.mjs
```

---

## Migration history

This codebase was ported from the Gatsby 4 + headless WordPress site at [fast-forward-innovation/fastforward-web](https://github.com/fast-forward-innovation/fastforward-web). The full migration plan, session-by-session notes, and every decision made during the port live at:

```
/Users/jasonyarrington/.claude/plans/setup-claude-for-use-groovy-kitten.md
```

(…in the sibling Gatsby repo's Claude Code plans directory, not committed to this repo.)

The WP content export ran once at the start of the port; the script lives at [scripts/export-wp-to-markdown.mjs](scripts/export-wp-to-markdown.mjs) and is idempotent in case it needs to run again while the WordPress backend is still available.
