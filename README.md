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
- [Continuous integration](#continuous-integration)
- [Editing content](#editing-content)
- [Deployment (Dev / Test / Live)](#deployment-dev--test--live)
  - [Multidev environments (`multi-*`)](#multidev-environments-multi-)
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

| Script | What it does | CI gate |
| ------ | ------------ | ------- |
| `npm run dev` | Dev server with Turbopack + HMR | |
| `npm run build` | Production build (the exact build Pantheon runs) | |
| `npm run start` | Serve the built app locally (for testing the prod bundle) | |
| `npm run lint` | ESLint (Next.js flat config) | ✅ |
| `npm run typecheck` | `tsc --noEmit` | ✅ |
| `npm run test` | Unit tests, then Playwright e2e | |
| `npm run test:unit` | Vitest unit tests | ✅ |
| `npm run test:unit:watch` | Vitest in watch mode | |
| `npm run test:storybook` | Vitest against the Storybook stories | |
| `npm run test:e2e` | Playwright e2e (chromium) | ✅ |
| `npm run test:e2e:ui` | Playwright in UI mode | |
| `npm run storybook` | Storybook dev server on :6006 | |
| `npm run build-storybook` | Static Storybook build | |
| `npm run doctor` | Verify this machine's toolchain and auth | |
| `npm run sync-env` | Reconcile `.env.local` against Pantheon's key list | |

**Before pushing**, run `npm run build` locally — it's what Pantheon will run, and it catches type errors + route-generation issues that `npm run dev` will let through.

### Continuous integration

`.github/workflows/test.yml` runs three required jobs on every PR to `main`, on
Node 20. All three must pass before a merge:

| Job | Command |
| --- | ------- |
| lint + typecheck | `npm run lint && npm run typecheck` |
| unit tests | `npm run test:unit` |
| e2e | `npm run test:e2e` (Playwright, chromium, 15-min timeout) |

Reproduce the whole gate locally in one line:

```bash
npm run lint && npm run typecheck && npm run test:unit && npm run test:e2e
```

If e2e fails immediately, you're probably missing the browser binary:
`npx playwright install --with-deps chromium`.

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

GitHub repo:

```
https://github.com/fast-forward-innovation/fastforward-com
```

**The repo and the Pantheon site have different names.** The Pantheon site is
`fastforward`; the GitHub repo is `fastforward-com`. Any `terminus` command that
takes a site name wants `fastforward`.

A clone has two remotes pointing at that same repo — `origin` over SSH and
`pantheon` over HTTPS. Push to `origin`; `pantheon` exists for Pantheon's
GitHub integration.

### Multidev environments (`multi-*`)

Branches prefixed `multi-` map to long-lived Pantheon **multidev** environments.
They are not feature branches:

| Branch | Environment |
| ------ | ----------- |
| `multi-content` | https://content-fastforward.pantheonsite.io/ |
| `multi-marketing` | (marketing multidev) |

Pushing to one of these rebuilds its environment directly — **no PR required**,
and the build takes several minutes. These branches are long-lived: don't delete
them after a merge, and don't open PRs from them. Use them to park work that
needs a stable URL for review (content drafts, marketing experiments) without
tying up a PR preview.

Ordinary feature branches get an ephemeral `pr-*` environment instead, created
automatically for each open PR.

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

1. Work on a feature branch → open PR → merge to `main`. Direct pushes to
   `main` are not used — every change goes through a PR, and
   `scripts/deploy-feature-branch.sh <branch>` does branch → push → open PR
   in one step.
2. Pantheon auto-deploys `main` to Dev. QA there.
3. When Dev is green, tag `pantheon_test_<date>` at that commit and push. QA on Test.
4. When Test is green, tag `pantheon_live_<date>` and push. Live updates.

### Pantheon CLI (terminus)

Install and authentication are in [ONBOARDING.md](ONBOARDING.md). The site name
is `fastforward`, and environments are `dev`, `content`, `test`, `live`, plus
ephemeral `pr-*`.

Read-only, safe to run any time:

```bash
terminus auth:whoami                  # who you're logged in as
terminus site:info fastforward        # confirms team access
terminus env:list fastforward         # every environment, incl. open PR envs
terminus env:view fastforward.dev     # open an environment in the browser
terminus secret:site:list fastforward # secret NAMES (values are never returned)
```

Changes state — know what you're doing, and don't point these at `live` casually:

```bash
terminus env:clear-cache fastforward.<env>
terminus env:clone-content fastforward.live fastforward.dev
terminus multidev:create fastforward.dev <name>
```

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

Pantheon's traditional cache *automation* — `pantheon.yml` Quicksilver hooks that fire PHP scripts on deploy — **is not supported on the Next.js platform**; the `pantheon.yml` file is silently ignored. (The `terminus` CLI itself works fine and we use it regularly; it's the `pantheon.yml` hook mechanism that doesn't exist here.) Instead, this site uses Pantheon's official [`@pantheon-systems/nextjs-cache-handler`](https://github.com/pantheon-systems/nextjs-cache-handler), wired up as Next's `cacheHandler` in [next.config.ts](next.config.ts) and exported from [cacheHandler.mjs](cacheHandler.mjs).

What it does for us:
- **Build-aware route cache.** On every new deploy the handler detects the new build ID and invalidates the Full Route Cache. This is what stops the "post-deploy multidev serves stale HTML referencing old `/_next/static/<hash>.css` paths until I click Clear Caches" failure mode.
- **Edge purges on `revalidateTag` / `revalidatePath`.** Pantheon sets `OUTBOUND_PROXY_ENDPOINT` on every environment; the handler uses it to purge the CDN whenever cache tags are invalidated server-side. The PCC revalidate webhook at [/api/revalidate](app/api/revalidate/route.ts) goes through this path.
- **Shared GCS-backed cache across containers.** On Pantheon, `CACHE_BUCKET` is set and the handler stores entries in Google Cloud Storage so every container sees the same cache. Locally `CACHE_BUCKET` is unset and the handler falls back to file-based caching — same code, no setup required.

The handler is configured with `type: "auto"`, so the GCS-vs-file decision is environment-driven and there's nothing to flip per-env.

For deeper reference: [Pantheon Next.js Considerations](https://docs.pantheon.io/nextjs/considerations) (notes the Quicksilver/`pantheon.yml` gap), [Caching Recommendations for Front-End Sites](https://docs.pantheon.io/guides/decoupled/wp-nextjs-frontend-starters/caching), and the [`nextjs-cache-handler` README](https://github.com/pantheon-systems/nextjs-cache-handler).

---

## Environment variables

See [.env.local.example](.env.local.example) for the canonical list and docs.

`.env.local.example` documents what each variable *does*; this table is about
**where each one is required**, which the example file can't tell you.

| Variable | Local | Dev / Test / Live | Missing means |
| -------- | :---: | :---------------: | ------------- |
| `MONDAY_API_TOKEN` | when working on the form | **required** | Contact form 500s on submit |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | test key | **required** | Frontend omits the Turnstile widget |
| `TURNSTILE_SECRET_KEY` | test key | **required** | Server skips bot verification |
| `PCC_SITE_ID` | when working on Lab pages | **required** | Content Publisher pages render empty |
| `PCC_TOKEN` | when working on Lab pages | **required** | Same as above |
| `PCC_WEBHOOK_SECRET` | — | **required** | Publish webhooks can't be verified |
| `MONDAY_INQUIRY_TYPE_COLUMN_ID` | optional | optional | Inquiries land untagged |
| `ANTHROPIC_API_KEY` | optional | optional | No Claude inquiry classification |
| `NEXT_PUBLIC_SITE_URL` | optional | optional | Falls back to `https://fastforward.sh` |
| `NEXT_PUBLIC_GITHUB_REPO` | optional | optional | Editorial toast can't link to the repo |

Locally, use Cloudflare's public "always passes" Turnstile test pair —
`npm run sync-env` fills it in for you.

**Nothing here is required to run the site locally.** With an empty
`.env.local`, `npm run dev` works; the features above degrade rather than break.
Pick up a token when you first need one.

**Pantheon's Secrets Manager is write-only.** `terminus secret:site:list` returns
secret *names* with null values, and `secret:site:local-generate` writes a
template for you to fill in — there is no supported way to read a value back
out. So `npm run sync-env` reconciles the set of keys in `.env.local` against
what production expects; it cannot fetch the values.

---

## Troubleshooting

### `ChunkLoadError` / 404 on `_next/static/chunks/*.js` after deploy
Should be rare now that the Pantheon cache handler (see [Caching on Pantheon](#caching-on-pantheon)) invalidates the Full Route Cache on every new build ID. If it does happen — usually a fluke where a request lands during the deploy window — hit **Clear Caches** on the environment in the Pantheon dashboard (or `terminus env:clear-cache fastforward.<env>` — the Pantheon site is `fastforward`, not `fastforward-com`) and refresh.

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
  pcc.ts                      Pantheon Content Publisher client (degrades to [] when unset)
  env.ts                      isLiveEnvironment() — reads PANTHEON_ENVIRONMENT
  trapFocus.ts                Focus-trap helper used by SiteHeader
content/
  projects/*.mdx              One file per case study
  pages/*.mdx                 Static pages, incl. blog/ and digital/ subtrees
  services.yml                Service taxonomy
  settings.yml                Site title, description, GA id, postsPerPage
  _migration-*.md             Notes from the Gatsby → Next.js port
public/
  content/images/YYYY/MM/     Migrated WP media (~140 MB)
  hero-images/                Homepage rotating heroes
  *.svg, icon.png, etc.       Static assets
scripts/
  doctor.sh                   Verify toolchain + auth (npm run doctor)
  sync-env.sh                 Reconcile .env.local with Pantheon's key list
  deploy-feature-branch.sh    Branch → push → open PR
  export-wp-to-markdown.mjs   One-shot WP → markdown exporter (kept for re-runs
                              against the old WP backend while it's still alive)
tests/                        Vitest unit tests + Playwright e2e
.storybook/                   Storybook config (npm run storybook, :6006)
brand/                        Brand kit — GUIDELINES.md, fonts, logos (see BRAND.md)
docs/                         Longer-form notes (PCC integration, talk outline)
demo-prompts/                 Slash commands that replay the migration as a demo
.claude/
  commands/                   Project slash commands (/workflow, /new-page, …)
  settings.json               Shared permissions — committed
.github/workflows/test.yml    CI: lint+typecheck, unit, e2e
.mcp.json                     Pantheon Content Publisher MCP server
cacheHandler.mjs              Pantheon cache handler wiring
next.config.ts                Image qualities, HSTS, /page/:num → / redirect
.nvmrc                        Node 20
package.json tsconfig.json eslint.config.mjs postcss.config.mjs
playwright.config.ts vitest.config.ts
```

Agent-facing docs live at the root: [CLAUDE.md](CLAUDE.md) (rules),
[CONTENT.md](CONTENT.md) (authoring), [DESIGN.md](DESIGN.md) (visual work),
[BRAND.md](BRAND.md) (pointer to `brand/`).

---

## Migration history

This codebase was ported from the Gatsby 4 + headless WordPress site at [fast-forward-innovation/fastforward-web](https://github.com/fast-forward-innovation/fastforward-web). What's committed here:

- [content/_migration-report.md](content/_migration-report.md) — what was ported and what changed
- [content/_migration-prompts.md](content/_migration-prompts.md) — the prompts used, phase by phase
- [docs/migration-talk-outline.md](docs/migration-talk-outline.md) — the talk written about it

The original session-by-session plan lives in the author's local Claude Code plans directory and was never committed, so it isn't available to anyone else.

The WP content export ran once at the start of the port; the script lives at [scripts/export-wp-to-markdown.mjs](scripts/export-wp-to-markdown.mjs) and is idempotent in case it needs to run again while the WordPress backend is still available.
