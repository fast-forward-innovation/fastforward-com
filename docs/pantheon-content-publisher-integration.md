# Pantheon Content Publisher → Lab Projects

**Phase 1a (shipped):** authoring in **Google Docs** with the **ArchieML** body format via Pantheon's Content Publisher add-on. Live end-to-end: collection + metadata schema in PCC, fetch + ArchieML adapter in [../lib/pcc.ts](../lib/pcc.ts), merged into [../lib/content.ts](../lib/content.ts), revalidation webhook at [../app/api/revalidate/route.ts](../app/api/revalidate/route.ts).
**Phase 1b (deferred):** **Smart Components** authoring — discovered late that schemas live in code, not the dashboard. Requires a `SmartComponentMap` + a `PantheonAPI` route handler + connecting the PCC collection to that API URL. The PantheonTree walker in [../lib/pcc.ts](../lib/pcc.ts) is already in place and dormant; only the authoring-side + dashboard-connect steps remain.
**Phase 2 (later):** add the **Microsoft Word / Office 365** add-in alongside Google Docs — same backend, same Next.js code, just a second authoring surface for editors who prefer M365.

## Context

Fast Forward's first lab project is the integration itself: prove that editors can author a lab page in Google Docs (via Pantheon's Content Publisher add-on, the original and most mature PCC authoring surface) and have it render as a `layout: lab-project` page on fastforward.sh — without touching the repo. Scope is **lab projects only**; case studies, project posts, and all other pages stay on local MDX. Office 365 / Word support comes in a follow-up phase that reuses 100% of the Next.js side.

Two decisions are already made:

- **Demo both authoring approaches side by side.** PCC supports two ways to author structured body content: **ArchieML** (typed-inline structural markup) and **Smart Components** (sidebar-inserted, schema-validated form blocks). They can't easily mix *inside one article body*, but they can coexist *inside one collection* — one test article authored each way, both rendering through the same `LabProjectArticle` component. This is itself a strong lab-project demo: a single piece of Next.js code consuming two very different authoring UXs.
- **ISR + on-publish revalidation.** A PCC webhook hits `/api/revalidate` on every publish. `revalidateTag()` refreshes the affected page on its next request — edits go live in seconds without a full Pantheon rebuild.

## ArchieML vs Smart Components — concise comparison

| Axis | ArchieML | Smart Components |
| --- | --- | --- |
| **Authoring UX** | Author types structural markup (`[+pageSections]`, `:end`) directly in the doc | Author picks blocks from the add-on sidebar; fills a form per block |
| **Error surface** | Silent parse failures on typos; debugging requires reading raw output | Schema-validated forms in the sidebar; bad input rejected before save |
| **Code snippets** | Colons inside snippets need `:end ... :end` multi-line value blocks | Snippet is just a `code` field on the component; no escaping needed |
| **Schema flexibility** | Free — add any key, parser doesn't care | Schema lives in PCC dashboard; admin must add a field before authors can use it |
| **Setup overhead (devs)** | One ArchieML parser dependency + an AST→`PageSection[]` mapper | Register a React renderer per Smart Component type **OR** (our choice) skip `ArticleRenderer` and walk the raw Slate AST ourselves |
| **Editor onboarding** | Train editors to write valid markup (structure in a Google Doc feels code-ish) | Train editors to use a UI; gentler, more "CMS-like" |
| **Schema enforcement** | None — each doc can drift | Strong — every instance of a component matches the dashboard schema |
| **Best fit** | Technical authors comfortable with markup; fast iteration | Non-technical editors; large editorial teams; long-lived content models |

The two approaches arrive at the *same* `Page` / `PageSection[]` shape on our side. A small adapter dispatches per article based on body shape (ArchieML markers vs. Slate AST with Smart Component nodes).

## Architecture

```
Google Docs + Pantheon add-on ──┐   (Word add-in plugs in here in Phase 2)
                                │
                       ┌────────┴────────┐
                       │                 │
              ArchieML article    Smart-Components article
                       │                 │
                       └────────┬────────┘
                                ▼
                Pantheon Content Cloud (collection: lab-projects)
                                │  (REST/GraphQL)
                                ▼
                lib/pcc.ts: fetchLabProjectArticles()
                                │
              ┌─────────────────┴──────────────────┐
              ▼                                    ▼
     parseArchieMl(body)                  walkSlateAst(body)
              │                                    │
              └────────── Page[] ──────────────────┘
                                │
                lib/content.ts::getAllPages()  ◀── merge with MDX pages
                                │
                app/[slug]/page.tsx (SSG + revalidateTag)
                                │
                LabProjectArticle (unchanged)
```

Webhook path:

```
Google Docs: Publish ──► PCC webhook ──► POST /api/revalidate
                                              │ (HMAC verify)
                                              ▼
                                         revalidateTag('pcc:lab-project:<slug>')
                                         revalidateTag('pcc:lab-projects')
                                              │
                                              ▼
                                     next request to /<slug> refetches
```

## Prerequisites (one-time, mostly outside the repo)

1. **Pantheon Content Publisher account + Collection** named `lab-projects`. Record the Collection ID. Generate an API token (shown once — store in Pantheon Secrets Manager).
2. **Define the article metadata schema** on the collection (same fields apply to both authoring approaches):
   - `label` (text, default "Lab Project")
   - `tagline` (text)
   - `brandColor` (text, hex)
   - `stack` (array of strings)
   - `tags` (array of strings)
   - `repoUrl` (URL)
   - `liveUrl` (URL)
   - `authoringApproach` (enum: `archieml` | `smart-components` — used to surface a small label on the rendered page for the demo)
3. **Define Smart Component schemas** in the dashboard for the rich block types:
   - `CodeBlock` — `filename`, `title`, `language`, `code` (long text), `caption`
   - `VideoBlock` — `provider` (enum: loom / youtube / file), `src`, `title`, `caption`, `aspectRatio`, `poster`
   - `TeamProfile` — `kind` (enum: individual / team), `name`, `role`, `bio`, `avatarSrc`, `links` (array of `{label, url}`)
   - `ImageBlock` — likely native image AST node; verify whether a Smart Component variant is needed
   - `ClientQuote` — `clientName`, `tagline`, `quote`
4. **Install the Google Docs add-on** for our Workspace tenant, connect it to the collection.
5. **Webhook secret.** Generate a random `PCC_WEBHOOK_SECRET`; store in Secrets Manager.

## Implementation steps

### 0. Persist the plan in the repo

Copy this plan into the repo as a permanent reference so anyone looking at the codebase six months from now understands the design intent, the alternatives we considered, and the trade-offs we accepted.

- Destination: [docs/pantheon-content-publisher-integration.md](pantheon-content-publisher-integration.md) (alongside the existing [docs/migration-talk-outline.md](migration-talk-outline.md)). Generic name — the same doc covers Google Docs (phase 1) and Word/Office 365 (phase 2). When phase 2 ships, append rather than fork.
- Content: the full contents of this plan file, verbatim. As work progresses we update the file in place — completed steps get checked off; risks resolved get notes appended; final architectural decisions get a short "what we actually built" footer.
- Cross-link: add one line to [CONTENT.md](../CONTENT.md)'s lab-project section ("Authoring lab projects via Pantheon Content Publisher — see [docs/pantheon-content-publisher-integration.md](docs/pantheon-content-publisher-integration.md)") so authors and devs find it from the existing content guide.

### 1. Wire up the Pantheon MCP server

Pantheon ships an official **Content Publisher MCP server** (public beta — [docs.content.pantheon.io/mcp](https://docs.content.pantheon.io/mcp)). Currently not configured in this user's environment. Add it via the `update-config` skill once we exit plan mode.

- File: project-scoped `.mcp.json` (keeps the PCC token out of `~/.claude`).
- Auth: PCC API token from prerequisite step 1.
- Smoke-test: MCP lists the `lab-projects` collection.

The MCP unlocks managing collections, fetching articles, and triggering preview/publish from inside Claude Code — useful for testing the integration without bouncing to the dashboard, and useful in phase 2 for managing the Word add-in registration too.

### 2. Install the PCC SDK (or fall back to direct fetch)

```bash
npm install @pantheon-systems/pcc-react-sdk @pantheon-systems/pcc-sdk-core archieml
```

Verify peer-dep compatibility with **React 19.2.4 / Next 16.2.4** on install. The SDK currently targets React 18; if peer-deps reject us, drop the SDK and call the REST API directly (we already use raw `fetch` in [app/api/contact/route.ts](../app/api/contact/route.ts)). We're not using `ArticleRenderer` anyway — we render blocks ourselves through `LabProjectArticle`.

`archieml` is the small NYT parser; ~5KB, no deps.

### 3. Env config

Extend [.env.local.example](../.env.local.example):

```bash
# Pantheon Content Publisher (lab projects)
PCC_SITE_ID=
PCC_TOKEN=
PCC_WEBHOOK_SECRET=
```

Set live values per environment via Pantheon Secrets Manager (Dev / Test / Live). `PCC_TOKEN` must be present at `next build` time on Pantheon — confirm by running a build with the secret injected.

### 4. New module: `lib/pcc.ts`

Single new file. Responsibilities:

- `fetchLabProjectArticles({ preview? })` — list endpoint, `publishingLevel: preview ? 'REALTIME' : 'PRODUCTION'`, tagged `next: { tags: ['pcc:lab-projects'] }`.
- `fetchLabProjectArticleBySlug(slug, { preview? })` — single-article fetch, tagged `pcc:lab-project:${slug}`.
- `articleToPage(article)` — the dispatcher. Inspects `article.content` (or whatever the SDK calls the body):
  - **If body is a string containing ArchieML markers** (`[+pageSections]` / `[.stack]`): run through `archieml.load()` → map keys 1:1 to `Page`.
  - **If body is a Slate AST**: walk node by node:
    - `paragraph` / `heading` / `list` / `image` nodes → accumulate into a `MainSection.richText` HTML string until a Smart Component node or explicit section break is hit. Headings start new MainSections.
    - Smart Component nodes — dispatch by `type` field to the matching `PageSection` constructor (`CodeBlock`, `VideoBlock`, `TeamProfile`, `ImageBlock`, `ClientQuote`).
  - Article metadata fields → `additionalPostFields` (same schema in both paths).
  - Output: a normalized `Page` with `layout: 'lab-project'` and `pageSections: PageSection[]`.

The two authoring approaches converge here; everything downstream is identical. Phase 2 (Word) feeds into this same function unchanged — the SDK abstracts the authoring source.

### 5. ArchieML schema for authors (when using the typed approach)

Canonical template (lives in [CONTENT.md](../CONTENT.md) + a starter Google Doc). **One `[.pageSections]` opener at the top**, blank lines between blocks, `[]` closer at the bottom:

```
[.pageSections]
type: TeamProfile
kind: individual
name: Jason Yarrington
role: Web Solutions
bio: One personable sentence here.

type: MainSection
title: Overview
background: white
tagline: A short eyebrow line above the heading.
richText:
  Paragraph one.

  Paragraph two with **bold** if needed.
:end

type: CodeBlock
filename: lib/pcc.ts
language: typescript
caption: A small typed wrapper around the SDK.
code:
  const PCC_SITE_ID = process.env.PCC_SITE_ID!;
  ...
:end

type: VideoBlock
provider: loom
src: https://www.loom.com/share/...
caption: Google Docs → publish → live in seconds.

[]
```

Header metadata (title, slug, stack, tags, etc.) lives in PCC's article-level metadata fields, not in the ArchieML body — same as for Smart Components articles. This keeps the two paths symmetric.

Notes on what we learned authoring the first article:

- PCC always returns `resolvedContent` as a JSON-encoded `TREE_PANTHEON_V2` AST, even for ArchieML body content — Google Docs serializes the doc as the tree. Our adapter extracts plain text (one line per paragraph) before handing it to `archieml.load()`.
- Slug lives in `metadata.slug`, not the top-level `article.slug` field — fall back accordingly.
- For tolerance, [../lib/pcc.ts](../lib/pcc.ts) normalises `[+pageSections]` and repeated `[.pageSections]` openers, strips a leading `:end\n` from multi-line values, and accepts flat `imageSrc/imageAlt/imageWidth/imageHeight` fields on `ImageBlock` rows (full nested-array syntax in ArchieML is awkward).

### 6. Smart Components — **deferred to Phase 1b**

> **Correction (mid-implementation).** The original plan assumed Smart Component schemas were defined in the PCC dashboard. They aren't — they live in code as a `SmartComponentMap` typed against `SmartComponentMapZod` from `@pantheon-systems/pcc-sdk-core/types`, exposed to the Google Docs add-on via a `PantheonAPI` route handler. The PCC dashboard's role is only to *connect* the collection to that API URL so the add-on can fetch the map. This is more involved than originally scoped, so Smart Components are deferred to **Phase 1b** (see end of this doc).

For Phase 1a we ship with ArchieML only. The PantheonTree walker in [../lib/pcc.ts](../lib/pcc.ts) is already in place and dormant — it'll start dispatching once Phase 1b connects the authoring side.

### 7. Extend the content loader

Update [lib/content.ts](../lib/content.ts):

- Make `getAllPages()` **async**.
- Add `async function getPccLabProjects(): Promise<Page[]>` that wraps `fetchLabProjectArticles()` + `articleToPage`.
- Merge: MDX pages first, PCC pages second; on slug collision, MDX wins and we `console.warn` (keeps repo authoritative).
- Dev caching unchanged for MDX; PCC fetches rely on Next's fetch cache + `revalidateTag`.

### 8. Route adjustments

[app/[slug]/page.tsx](../app/[slug]/page.tsx):

- `generateStaticParams()` becomes async, awaits `getAllPages()`.
- `generateMetadata()` + `DynamicPage` `await getPageBySlug(slug)` (it becomes async).
- **Switch `dynamicParams = true`** with `notFound()` fallback — so a brand-new PCC article goes live on first request without waiting for the next list-refresh. Keeps the SSG-on-first-hit, revalidate-after model.

### 9. Revalidation webhook route

New file: `app/api/revalidate/route.ts`.

- Accepts `POST` with `?token=` query string (PCC doesn't sign webhooks, so we authenticate via a URL secret).
- Constant-time-compares `?token=` to `PCC_WEBHOOK_SECRET`.
- On `article.publish` / `article.unpublish` / `article.update`: `revalidateTag('pcc:lab-projects', 'max')` — every PCC fetch is tagged with this, so one call invalidates both the list and per-slug caches.
- Returns 204 on success, 401 on bad token, 400 on invalid JSON.

> **Why URL secret, not HMAC.** Inspecting the actual webhook payloads in `get_webhook_logs` showed PCC sends `{ articleId, siteId }` with no signing header. The MCP `update_collection` schema also doesn't expose a webhook signing secret. URL-token auth gives equivalent shared-secret security over HTTPS, with the trade-off that the secret appears in PCC's webhook logs and the receiving server's access logs (acceptable here since the endpoint only invalidates a cache tag).

### 10. Register the webhook with PCC

Via the dashboard or the MCP server's `update_collection` (with `webhookConfig`):

- URL: `https://www.fastforward.sh/api/revalidate?token=<PCC_WEBHOOK_SECRET>` (and Test / Dev environment URLs).
- Events: `article.publish`, `article.unpublish`, `article.update`. (Verified via `get_available_webhook_events` — names use the bare verb, not `…ed`.)

### 11. Demo content — one ArchieML article (Phase 1a)

Ship the integration with one seed article in the `lab-projects` collection:

- `pcc-archieml-demo` — narrative entirely in ArchieML inside a Google Doc. Show off the markup conventions.

It renders via `LabProjectArticle`. The Smart Components counterpart (`pcc-smart-components-demo`) gets created once Phase 1b ships.

### 12. Document for authors

Add a `## Lab project — Pantheon Content Publisher (Google Docs)` subsection to [CONTENT.md](../CONTENT.md) covering:

- The ArchieML vs Smart Components comparison (verbatim from the table above).
- When to pick which approach.
- The ArchieML template (copy-pasteable starter).
- How to insert Smart Components in Google Docs (link to add-on docs).
- The auth + publish loop.
- That code/snippet content in ArchieML must use `:end ... :end` blocks.
- A short forward-looking note: "Phase 2 will add the Microsoft Word / Office 365 add-in alongside this. Same backend, same Next.js code — authors will be able to choose Google Docs or Word per article."

## Phase 1b — Smart Components (deferred)

Goal: enable authors to insert structured blocks (CodeBlock, VideoBlock, TeamProfile, ClientQuote) from the Pantheon add-on sidebar in Google Docs, rather than typing ArchieML markup. The rendered output is identical; only the authoring surface changes.

What we learned mid-implementation: Smart Components are **defined in our Next.js code**, not in the PCC dashboard. The dashboard only knows how to reach our component definitions because we expose them through a `PantheonAPI` route handler and tell the PCC collection where that route lives.

### Work to do

1. **Define the SmartComponentMap.** New file: `lib/smart-components.ts`. Exports a single object typed against `SmartComponentMap` (from `@pantheon-systems/pcc-sdk-core/types`). One entry per block type. Field names match [../lib/types.ts](../lib/types.ts) so the existing PantheonTree walker maps near-identity:

   - `CodeBlock` — `title` (string), `filename` (string), `language` (string), `code` (textarea), `caption` (string).
   - `VideoBlock` — `provider` (enum: loom/youtube/file), `src` (string), `title` (string), `caption` (string), `aspectRatio` (string), `poster` (string).
   - `TeamProfile` — `kind` (enum: individual/team), `name` (string, required), `role` (string), `bio` (textarea).
   - `ClientQuote` — `clientName` (string), `tagline` (string), `quote` (textarea).

2. **Mount the PantheonAPI route.** New file: `app/api/pantheoncloud/[...command]/route.ts`. Uses `PantheonAPI` from `@pantheon-systems/pcc-react-sdk` (or `pcc-sdk-core` — confirm at build) with the `SmartComponentMap` passed in. Wires up the endpoints the add-on calls (component map, preview, article fetch). Same pattern as the `nextjs-starter-approuter-ts` reference at github.com/pantheon-systems/content-publisher-sdk.

3. **Connect the PCC collection.** In the PCC dashboard: edit the `lab-projects` collection → set the site/API URL to `https://www.fastforward.sh/api/pantheoncloud` (and the Test URL for the test environment). After this, `get_collection` should return `isSiteConnected: true` and the Google Docs sidebar should list the Smart Components.

4. **Iterate the PantheonTree walker.** Author one Smart Components article. Fetch via the SDK with `withContent: true`. Inspect the actual `attrs` shape on each component node. Refine `smartComponentToSection` in [../lib/pcc.ts](../lib/pcc.ts) if field naming differs from the map. Expect ≤ 30 minutes of adjustment.

5. **Ship a `pcc-smart-components-demo` article** alongside the ArchieML one. Set `authoringApproach: smart-components` in metadata.

### Verification

- `get_collection` shows `isSiteConnected: true` against the lab-projects collection.
- A test article authored with one of each Smart Component renders correctly at `/<slug>` with all four block types visible.
- Editing the test article in Google Docs and republishing updates the page within seconds via the existing webhook (no rebuild).

### Risk / unknowns

- The dashboard step (3) is the only piece I couldn't probe via MCP today — `update_collection` may or may not accept the API URL. Worth checking once we're ready to ship this.
- `PantheonAPI` may require the older Pages-Router style API handler signature; the App-Router catch-all needs to adapt. Verify against the starter repo.

## Phase 2 — Microsoft Word / Office 365 (deferred)

Reuses everything from phase 1 unchanged. Phase-2 work:

- Install the Pantheon Content Publisher M365 add-in in the same Microsoft 365 tenant.
- Connect it to the **same** `lab-projects` collection — so Word and Google Docs articles live side by side.
- Verify the M365 add-in supports ArchieML body and Smart Components identically (it should; both are content-side concepts, not editor-side).
- Update the CONTENT.md author guide with a Word-specific section ("you can author the same way from Word — pick whichever editor you prefer per article").

No code changes anticipated for phase 2. If any surface (e.g. add-in tool list inside the MCP server) requires adjustment, fold it into the same MCP config from step 1.

## Critical files

- **New:** [docs/pantheon-content-publisher-integration.md](pantheon-content-publisher-integration.md) (this plan, copied into the repo), [lib/pcc.ts](../lib/pcc.ts), [app/api/revalidate/route.ts](../app/api/revalidate/route.ts), `.mcp.json`
- **Modified:** [lib/content.ts](../lib/content.ts), [lib/types.ts](../lib/types.ts) (extend `Page` with `pccArticleId?` and `source?: 'mdx' | 'pcc-archieml' | 'pcc-smart-components'` for debugging + the demo label), [app/[slug]/page.tsx](../app/[slug]/page.tsx), [.env.local.example](../.env.local.example), [CONTENT.md](../CONTENT.md)

Existing components ([components/LabProjectArticle.tsx](../components/LabProjectArticle.tsx), all of [components/postBlocks/](../components/postBlocks/)) are **not touched** — that's the point of normalizing both authoring approaches to the existing `PageSection[]` shape, and the reason phase 2 will require zero Next.js changes.

## Verification

End-to-end:

1. `npm run lint && npm run build` — clean. Build pulls articles from PCC at build time using `PCC_TOKEN` from `.env.local`.
2. Existing [/lab-project-sample](http://localhost:3000/lab-project-sample) (MDX-authored) still renders identically — confirms MDX path untouched.
3. `/pcc-archieml-demo` renders with all five block types (TeamProfile, MainSection, CodeBlock, VideoBlock, ImageBlock) — confirms the ArchieML path from Google Docs.
4. `/pcc-smart-components-demo` renders the same outline with the same block types — confirms the Slate-AST path from Google Docs.
5. Edit either demo article in Google Docs, republish. Hit `/<slug>` → updates within seconds, no rebuild. Confirms revalidate webhook + `revalidateTag`.
6. Deploy to Pantheon Test (`pantheon_test_*` tag), repeat 3–5 against the Test URL — confirms env wiring + webhook round-trip in a real environment.
7. From Claude Code: invoke a Pantheon MCP tool ("list articles in lab-projects") — confirms MCP install.

## Known risks / open items

- **SDK compat** with React 19 / Next 16 — verify on install; fall back to direct `fetch` if peer-deps reject.
- **Slate AST shape** — Pantheon docs don't publicly document every node type. The walker may need adjustment after a first published article — expect to iterate once on the mapping.
- **ArchieML colons in code** — must be inside `:end ... :end` blocks. Document; tolerate parse errors per-key so one bad doc doesn't crash the build.
- **Image hosting** — PCC likely hosts article images on its CDN. Add the Pantheon image domain to [next.config.ts](../next.config.ts) `images.remotePatterns` after the first published article confirms the URL pattern.
- **Slug collisions** — MDX wins; we log a warning. Long-term, enforce slug uniqueness in the PCC collection schema.
- **Editor onboarding** — ArchieML is unfamiliar; Smart Components require dashboard schemas to exist. Ship a one-page cheat sheet + the starter Google Doc.
- **Phase-2 parity** — the assumption "Word and Google Docs feed the same pipeline unchanged" should be verified once the M365 add-in is in our tenant, not taken on faith.
