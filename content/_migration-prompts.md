# Migration retrospective: Gatsby + WordPress → Next.js 16

_Compiled 2026-06-08. Migration executed 2026-04-17._

## About this document

A phase-by-phase record of the port of `fastforward-web` (Gatsby 4 + headless WordPress on Pantheon WP hosting) to `fastforward-com` (Next.js 16 App Router + static markdown/YAML on Pantheon Next.js hosting).

**Why the prompts are reconstructed, not verbatim.** The Claude Code sessions that drove Phases 0–7 ran on 2026-04-17. The transcripts (`~/.claude/projects/-Users-jasonyarrington-dev-fastforward-web-next/*.jsonl`) for that date are no longer on disk — they expired, never persisted, or lived on a different machine. The earliest surviving JSONL in this project's directory starts 2026-04-18. So every "seed prompt" below is a one-sentence reconstruction inferred from three sources:

1. The phase's name + bullet objectives in the plan at `/Users/jasonyarrington/.claude/plans/setup-claude-for-use-groovy-kitten.md`.
2. The chronological "Session log" entries in that plan file (the "Phase N complete" lines).
3. The commit messages in `git log` for the matching commits.

Each reconstructed prompt carries `(reconstructed)` so a reader never mistakes it for a verbatim quote.

The phase-to-commit map is at the bottom (Appendix).

---

## Phase 0 — Scaffold + configure

**Status:** done · **Commit:** `5a94f8b` (bundled with Phase 1)
**Seed prompt (reconstructed):**
> Start Phase 0 — scaffold the new Next.js repo at `/Users/jasonyarrington/dev/fastforward-web-next/` per the plan, swap fonts to `next/font`, port the Tailwind theme, and copy public assets.

**Delivered:**
- `create-next-app` produced **Next 16.2.4 + React 19 + Tailwind 4** (not the planned Next 14 / Tailwind 3 — adjusted in flight).
- Manrope + JetBrains Mono via `next/font/google`, wired to CSS variables in `app/globals.css`.
- Custom `ff_*` palette, `ff_siteWidth`, and font-size ramp ported into the Tailwind 4 `@theme { … }` block.
- `engines.node ≥ 20` so Pantheon picks a compatible runtime.

**Notable discovery:** Tailwind 4 has no `tailwind.config.ts` by default — theme lives in `@theme { … }` inside `app/globals.css`. The plan's `tailwind.config.ts` references became outdated.

---

## Phase 1 — Content export script

**Status:** done · **Commit:** `5a94f8b` (bundled with Phase 0)
**Seed prompt (reconstructed):**
> Write `scripts/export-wp-to-markdown.mjs` and run it once against the live WPGraphQL endpoint — export pages, projects, services, settings, and all referenced media into `content/` and `public/content/images/`.

**Delivered:**
- One-shot export script in the **new** repo (not the old one — uses its own deps).
- Idempotent: wipes `content/` and `public/content/images/` on each run.
- ACF flexible-content layouts introspected first; MainSection / ImageBlock / ClientQuote union confirmed.
- Handles both `/app/uploads/` (Pantheon) and `/wp-content/uploads/` (stock WP) prefixes.
- **One run wrote:** 2 pages, 8 projects, 14 services, 46 unique media (~140 MB). Zero warnings. ClientQuote unused but component still ported.

**Open decision deferred:** 140 MB of images committed as-is. Revisit only if repo bloat becomes a real issue.

---

## Phase 2 — Content loader + core layout

**Status:** done · **Commit:** `782cb70`
**Seed prompt (reconstructed):**
> Build the typed content loader (`lib/content.ts` + `lib/types.ts`), root `app/layout.tsx` with fonts and `generateMetadata`, and port `SiteHeader` and the footer triple from the Gatsby repo.

**Delivered:**
- `lib/content.ts` — synchronous, build-time, memoised. Functions: `getAllProjects`, `getProjectBySlug`, `getAllPages`, `getPageBySlug`, `getFeaturedProjects`, `getServices`, `getSettings`, `getPaginatedProjects`.
- `lib/types.ts` — `Project`, `Page`, discriminated `PageSection` union, `Service`, `Settings`.
- `lib/trapFocus.ts` ported unchanged from the Gatsby helper.
- `SiteHeader` is a client component (`usePathname` + menu state + focus trap). Footer triple (`ContactBlock`, `Footer`, `FooterBlock`) ports as server components.
- Extended `globals.css` with base typography, gradient utilities, hand-rolled hamburger (replacing `tailwind-hamburgers` to dodge Tailwind 4 compat risk).

---

## Phase 3 — Project routes + homepage + block components

**Status:** done · **Commit:** `f32f24b`
**Seed prompt (reconstructed):**
> Port all seven block components (MainSection, ImageBlock, QuoteBlock, ProjectCard, FeaturedProjects, ServiceBlock, TextBlock), build the homepage, `/our-work` listing, and `/our-work/[slug]` detail with `generateStaticParams` and `generateMetadata`.

**Delivered:**
- Seven block components ported, all using `next/image` with explicit `width`/`height` from frontmatter (no CLS).
- `components/Post.tsx` wraps the project detail view (hero + label + services + `pageSections` map + FeaturedProjects).
- `HomepageBanner` is `'use client'` — three static hero images, timed crossfade via `setInterval`, CSS-driven animated underline on the word list.
- `npm run build`: 13 static pages + 8 SSG project pages, zero type errors.

**Intentionally skipped:** `/page/[num]` pagination. With 8 projects and `postsPerPage = 10`, anything beyond page 1 is meaningless. Legacy URLs handled by a redirect added in Phase 7.

---

## Phase 4 — Dynamic pages + contact + 404

**Status:** done · **Commit:** `3b45122`
**Seed prompt (reconstructed):**
> Add `app/[slug]/page.tsx` that dispatches between `Page` and `LandingPage` by frontmatter `layout`. Wire up `/contact-us` (placeholder form), `/contact-submitted` (reads `?success=`), and a `not-found` page.

**Delivered:**
- `app/[slug]/page.tsx` with `dynamicParams = false` (unknown slugs 404) and `generateStaticParams` from `getAllPages()`.
- `Page` (simple WP-page wrapper) and `LandingPage` (hero + feature grid + WP content + FeaturedProjects) ported.
- `/contact-us` with a form placeholder (real `ContactForm` lands in Phase 5).
- `/contact-submitted` reads `searchParams.success`, marked `noindex`.
- Build: 17 routes total. Live smoke test: 9/9 URLs correct, `/nonexistent-page` 404s.

---

## Phase 5 — Contact form + Monday API route

**Status:** done · **Commit:** `bcec824`
**Seed prompt (reconstructed):**
> Replace the WP REST endpoint with `app/api/contact/route.ts` POSTing to Monday.com (board 3979078971, group `new_group99744`) using GraphQL variables instead of inline JSON. Port `ContactForm` as a `'use client'` component.

**Delivered:**
- POST route validates payload, sanitizes strings (strip tags + collapse newlines — matches the WP behavior), uses GraphQL **variables** to pass `column_values` (avoids the PHP's double-escape hazard).
- Reads `MONDAY_API_TOKEN` from env. 500 on missing token, 400 on bad input, 502 on Monday errors, 200 on success.
- `ContactForm.tsx` ports the Gatsby form: client-side validation, grouped phone inputs, `router.push('/contact-submitted?success={true|false}')`.
- Contact-form CSS moved into `globals.css`. Build: 18 routes.

**⚠️ Security debt flagged for Phase 7:** rotate the Monday token that was hardcoded in the WP plugin's source.

---

## Phase 6 — SEO + metadata

**Status:** done · **Commit:** `d73ecfd`
**Seed prompt (reconstructed):**
> Do the full SEO pass — extend root `generateMetadata` with Open Graph + Twitter card, add `app/sitemap.ts` / `app/robots.ts` / `app/manifest.ts`, and wire Google Analytics via `@next/third-parties/google`.

**Delivered:**
- Root `generateMetadata` now emits `metadataBase`, title template, description, OG, Twitter card — all from `content/settings.yml`.
- `app/sitemap.ts` enumerates homepage + `/our-work` + `/contact-us` + 8 projects + 2 pages with per-project `lastModified` dates.
- `app/robots.ts` disallows `/contact-submitted` and `/api/`, points at sitemap.
- `app/manifest.ts` ports `gatsby-plugin-manifest` values.
- GA injected via `@next/third-parties/google` reading `gaTrackingId` from settings (verified `G-YPFDS2CY4K` in prod build output).
- Build: 21 routes total — sitemap.xml, robots.txt, manifest.webmanifest all statically generated.

---

## Phase 7 — Visual QA + launch

**Status:** done (engineering); DNS cutover and WP-endpoint decommission remain user-driven.
**Seed prompt (reconstructed):**
> Pre-flight for launch — replace the create-next-app README, add `.env.local.example`, add a permanent redirect for `/page/:num` → `/`, then run visual QA and fix anything that regressed.

**Delivered:**
- **Pre-flight (`f70c7a7`):** new README, `.env.local.example`, `.gitignore` carve-out, `/page/:num` → `/` permanent redirect.
- **Visual-QA fix chain:** header responsive-prefix bug `2f16f05`, landmark/layout flattening `56603c3`, favicon `9dbfca2`, Contact-Us gradient `ea5db68`, featured-image overflow `128254a`, overscroll rubber-band `8131c50`, gradient-hover transition `41717ab`.
- **Next 16 quirk (`24b3d03`):** explicit `images.qualities: [75, 90]` allowlist required since HomepageBanner + landing pages use quality 90.
- **README expansion (`16a3fbf`):** full contributor/operator guide — shipped via PR #1 because direct push to `main` is BLOCKed at the harness level.
- **Monday token:** rotated. Old token revoked. New token stored in Pantheon Secrets Manager only.
- **Pantheon Dev / Test / Live:** all provisioned and serving 200 OK. Test + Live tagged from commit `24b3d03` via `pantheon_test_initial` / `pantheon_live_initial`.
- **Lighthouse on Dev:** 98 / 92 / 100 / 58 (SEO low only because Pantheon non-Live envs force `noindex`).
- **Dropped by decision:** Vitest snapshot suite. Snapshots would all fail against frontmatter-driven props; visual QA was the better trade.

**Cross-cutting Tailwind 4 lesson learned during this phase:** custom classes need to live in an `@utility` at-rule (not `@layer components/utilities/base`) if they're ever used with a responsive prefix like `lg:`. Otherwise the prefix silently no-ops. Burned us at least twice (`2f16f05`, `ea5db68`).

**Still outstanding (user-driven, not engineering):**
- Point `www.fastforward.sh` DNS at Pantheon Live.
- After cutover, decommission `/wp-json/ff-website-contacts/v1/submit` on the old WP site so any client pinned to the pre-rotation Monday token stops working.

---

## Post-launch operations (2026-04-18 onward)

These have **real, verbatim** prompts in the ongoing session JSONL `d68ee1b1-ad3d-4d13-9e59-065c557a7752.jsonl`:

- **2026-06-08 "continue the migration"** — audit of remaining work, plan-file freshness sweep, identification of unpushed `16a3fbf`.
- **2026-06-08 "Push the README expansion."** — hit the `main`-branch BLOCK rule, pivoted to a feature branch + PR (`docs/expand-readme`, PR #1).
- **2026-06-08 "How do I install gh"** → `brew install gh` + `gh auth login`. PR #1 then opened via `gh pr create`.
- **2026-06-08 "Update our notes about the migration to include how we are managing pull requests now."** → "Operations notes" section added to `content/_migration-report.md` documenting the PR-only workflow + a `feedback` memory saved for future sessions.
- **2026-06-08 "Can we list the prompts and the phases from the migration project we did on this site."** → this document.

---

## Appendix — phase-to-commit map

| Phase   | Title                                        | Commit(s)                                                                                                              |
|---------|----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| 0 + 1   | Scaffold + content export                    | `5a94f8b`                                                                                                              |
| 2       | Content loader + layout + header/footer      | `782cb70`                                                                                                              |
| 3       | Homepage, our-work, project detail, blocks   | `f32f24b`                                                                                                              |
| 4       | Dynamic WP pages, contact routes, 404        | `3b45122`                                                                                                              |
| 5       | Contact form + Monday API route              | `bcec824`                                                                                                              |
| 6       | SEO, sitemap, robots, manifest, GA           | `d73ecfd`                                                                                                              |
| 7 (pre) | README + env example + legacy redirect       | `f70c7a7`                                                                                                              |
| 7 (fix) | Visual-QA fix chain                          | `2f16f05`, `56603c3`, `9dbfca2`, `ea5db68`, `128254a`, `8131c50`, `41717ab`                                            |
| 7 (Next-16) | images.qualities allowlist               | `24b3d03`                                                                                                              |
| 7 (docs) | README expansion (via PR #1)                | `16a3fbf`                                                                                                              |
