# fastforward-web (Next.js)

Production website for **Fast Forward** — Next.js 16 App Router, React 19, Tailwind 4, TypeScript. Ported from the previous Gatsby 4 + headless WordPress implementation; content is now static markdown/YAML in this repo.

Deployed on **Pantheon Next.js hosting** (GitHub-source, containerized Node).

## Quick start

```bash
nvm use                 # Node 20+ (see package.json engines)
npm install
cp .env.local.example .env.local    # then fill in MONDAY_API_TOKEN
npm run dev             # http://localhost:3000
```

## Scripts

| Script            | What it does                                         |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Dev server with Turbopack, HMR                       |
| `npm run build`   | Production build (static generation for most routes) |
| `npm run start`   | Serve the built app locally                          |
| `npm run lint`    | ESLint (Next.js flat config)                         |

## Project layout

```
app/                   App Router routes (+ sitemap.ts, robots.ts, manifest.ts)
  api/contact/         POST route that forwards the contact form to Monday.com
  our-work/[slug]/     SSG project detail pages
  [slug]/              SSG WP-style static pages (privacy-policy, accessibility)
components/            Server + 'use client' components (SiteHeader, footer/*, block renderers)
content/               Site content — edit here, not in a CMS
  projects/*.mdx       One file per case study
  pages/*.mdx          One file per static page
  services.yml         Service taxonomy
  settings.yml         Site title, description, GA id, posts-per-page
lib/                   content.ts (loader), types.ts, trapFocus.ts
public/
  content/images/      Migrated WP media (~140 MB, year/month/filename)
  hero-images/         Homepage rotating heroes
scripts/
  export-wp-to-markdown.mjs    One-shot WP → markdown/YAML exporter (used once; kept for re-runs)
```

## Editing content

Content lives in `content/`. Each project is an `.mdx` file with YAML frontmatter that the typed content loader (`lib/content.ts`) reads at build time. See [lib/types.ts](lib/types.ts) for the schema.

To add or edit a project:

1. Add or modify `content/projects/<slug>.mdx`
2. Drop any referenced images under `public/content/images/YYYY/MM/` and reference them in frontmatter (`src: /content/images/…`, with `width` and `height` to avoid CLS)
3. Commit and push — Pantheon builds from `main`

Re-running the WP exporter (`node scripts/export-wp-to-markdown.mjs`) is idempotent — it wipes `content/` and `public/content/images/` and writes a fresh snapshot. Only useful while the old WP site is still alive.

## Environment variables

See [.env.local.example](.env.local.example). For production, set these in Pantheon's **Secrets Manager**:

- `MONDAY_API_TOKEN` — required; contact form API route posts to Monday.com with this
- `NEXT_PUBLIC_SITE_URL` — optional override; default is `https://www.fastforward.sh`

## Deployment

Pantheon builds automatically from `main`. See the [Pantheon Next.js docs](https://docs.pantheon.io/nextjs) for initial setup. Notes:

- Pantheon runs a long-lived Node container (not serverless). API routes, ISR, and server rendering all work; HTTP streaming does not.
- Node version is selected from `package.json` `engines` — currently `>=20`.
- Multidev gives each git branch a preview environment.

## Migration history

See [.claude/plans/setup-claude-for-use-groovy-kitten.md](../.claude/plans/setup-claude-for-use-groovy-kitten.md) in the sibling Gatsby repo for the full migration plan and session log.
