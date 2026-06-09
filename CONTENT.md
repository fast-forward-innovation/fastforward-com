# Content authoring guide

You are helping draft new content for **Fast Forward** (`fastforward.sh`). Read this guide before writing any new MDX or YAML in `content/`.

The schema is the source of truth. Always check [lib/types.ts](lib/types.ts) before drafting — never invent frontmatter fields. If you need a field that doesn't exist, surface it and ask before adding.

## Content types we author today

| Type | Location | Schema | Reference exemplar |
| --- | --- | --- | --- |
| Project case study | `content/projects/<slug>.mdx` | `Project` in [lib/types.ts](lib/types.ts) | [content/projects/growing-with-pantheon.mdx](content/projects/growing-with-pantheon.mdx) |
| Default-layout static page | `content/pages/<slug>.mdx` (`layout: default`) | `Page` in [lib/types.ts](lib/types.ts) | [content/pages/accessibility.mdx](content/pages/accessibility.mdx) |
| Case-study-layout static page | `content/pages/<slug>.mdx` (`layout: case-study`) | `Page` in [lib/types.ts](lib/types.ts) | [content/pages/museum-experiences.mdx](content/pages/museum-experiences.mdx) |
| Lab-project-layout static page | `content/pages/<slug>.mdx` (`layout: lab-project`) | `Page` in [lib/types.ts](lib/types.ts) | [content/pages/lab-project-sample.mdx](content/pages/lab-project-sample.mdx) |

**Note on landing pages:** [components/LandingPage.tsx](components/LandingPage.tsx) renders the `layout: landing` page type but the hero copy, three feature cards, and CTA are currently hard-coded in JSX, not driven by frontmatter. Until that component is refactored, do not author new pages with `layout: landing` — they will not render the campaign-specific content. Use `layout: default` instead and call this out to the user.

## Project case study — the canonical shape

Case studies follow a six-section arc, mined from the established voice in [growing-with-pantheon.mdx](content/projects/growing-with-pantheon.mdx):

1. **The Challenge** — the human/business reality that prompted the work. Lead here, never with tech.
2. **The Approach** — what was on the table, what we picked, why. Use the verdict-list HTML pattern (below) when comparing options.
3. **The Stack** — what's underneath. Brief, framed in service of the editorial/business outcome.
4. **How We Built It** — the work itself: tools, process, decisions, what failed and what didn't.
5. **The Result** — what changed for the customer in plain language. End with a one-line lesson in `<strong>`.
6. **Behind the Curtain** (or "Technical Notes") — the deepest tech detail; reserved for the end so the body of the piece stays human.

Sections render via [components/postBlocks/MainSection.tsx](components/postBlocks/MainSection.tsx). The component auto-numbers MainSections `(01)`, `(02)`, … — only MainSections count, ImageBlocks and Quotes don't bump the counter.

### Frontmatter fields that matter

```yaml
title: "..."                         # the case-study headline; H1 on the detail page
slug: "..."                          # kebab-case; must be unique across content/projects/
date: "YYYY-MM-DDT12:00:00"          # publish date
excerpt: "..."                       # 1–3 sentences; appears in cards and OG description
isSticky: false                      # true to pin to top of /our-work; usually false
featuredImage:                       # full-bleed hero on the detail page
  src: "/content/images/<scope>/<name>.<ext>"
  alt: "..."
  width: 2880
  height: 1614
cardImage:                           # used in /our-work grid; can be square
  src: "..."
  alt: "..."
  width: 2880
  height: 2880
additionalPostFields:                # all optional
  label: "Client or campaign label"  # small text above the title on the detail page
  brandColor: "#dd2e2a"              # hex; tints the gradient behind the hero
  seoDescription: "..."              # overrides excerpt for OG/Twitter when set
services: ["development", "..."]     # slugs from content/services.yml — see Service taxonomy
pageSections: [...]                  # ordered array of MainSection / ImageBlock / ClientQuote
```

### Block types in `pageSections`

`pageSections` is a discriminated union. The full type definition is in [lib/types.ts](lib/types.ts).

**`MainSection`** — rich-text section with the auto-numbered marker.
- `title` — the **short label** that appears below the auto-number (e.g., "The Challenge", "The Stack"). Title Case noun phrase.
- `tagline` — the **descriptive headline** rendered as the section H3 (e.g., "When the site model drifts from the editorial reality"). Sentence case.
- `background` — `white` (default) or `gray`. Alternate them; never two grays in a row.
- `richText` — HTML string (paragraphs, `<strong>`, `<code>`, `<dl>`, etc.). YAML block scalar (`>`) for readability.
- `blocks` — optional embedded blocks rendered **inside this section's content column** (the right ¾), after `richText`. Lets a block live *inside* a numbered section (sharing its `(0N)` marker and heading) and inherit the section's background, instead of being its own top-level section. Embeddable types: `CardGrid` and `FeaturedWork`. Embedded blocks render bare — no section wrapper or own background — so set the **MainSection's** `background`, not the block's.

**`ImageBlock`** — one or two side-by-side images. Use to break rhythm between long copy sections, especially after dense MainSections. Each image needs `src`, `alt`, `width`, `height`.

**`CardGrid`** — a responsive grid of titled cards (format/audience sets, or text-only feature/value cards). Fields: `cards` (each `{ title, description?, image? }`), `columns` (`2`/`3`/`4`, default `3`), `background`. **Preferred:** embed it in the owning MainSection's `blocks` array — it renders bare in the content column and inherits the section's background (drop the grid's own `background`; the MainSection carries the auto-number, tagline, and intro). It can also stand alone as a top-level section directly after a MainSection (give both the **same `background`**), but embedding keeps the pair as one numbered section. Card `image` supports `placeholder` + `notes`. Card `description` may contain inline lists, which keep the standard teal-square bullets. Does **not** bump the auto-number.

> **Future improvement:** conceptual card sets (values, principles, process steps — e.g. the immersive "What we bring" and museum "principles"/"how we work" grids) are currently **text-only**. The `image` field already exists per card, so they could gain illustrative icons/imagery later; for now plain text reads better than placeholder icon boxes that would never be filled. Revisit once real card art/iconography exists.

**`ClientQuote`** — customer quote with attribution. Fields: `clientName`, `tagline`, `quote`.

### Voice and structure rules

- **Lead with the human/business reality** — not the tech. The Challenge section opens on what the editorial team / customer was actually doing, not on the framework.
- **Tech specs go last** — push every framework name, library version, and config detail into "Behind the Curtain". The middle of the piece is for decisions and tradeoffs, not specs.
- **Tagline = sentence-case descriptive headline; title = Title Case short label.** They are not interchangeable. The component renders `tagline` as the visual H3 and `title` as a small label under the auto-number.
- **Background alternation:** start `white`, alternate to `gray` for "How We Built It" or "Behind the Curtain". Never put two `gray` MainSections back to back.
- **One-line closing lesson** — end "The Result" with a `<strong>`-wrapped takeaway sentence, e.g., `<strong>match the site model to the editorial team, and pick the platform shape that supports it.</strong>`
- **Use ImageBlocks as breath** — drop one between long MainSections to give the eye somewhere to land.

### Special HTML patterns established in `growing-with-pantheon`

- **Option comparison list** — when "The Approach" weighs alternatives:
  ```html
  <dl class="verdict-list">
    <div data-verdict="rejected">
      <dt>Option 01</dt>
      <dd>Description of the rejected option and why.</dd>
    </div>
    <div data-verdict="chosen">
      <dt>Option 03</dt>
      <dd>Description of the chosen option and why.</dd>
    </div>
  </dl>
  ```
- **`<strong>`** for product/brand names and the closing lesson.
- **`<code>`** for filenames, commands, env vars, function names — never for product names.

## Default-layout static page

For pages like About, Approach, Process, Privacy, Accessibility — anything that's a single column of prose without the case-study structure.

```yaml
---
title: "..."
slug: "..."          # unique across content/pages/
date: "YYYY-MM-DDT12:00:00"
layout: default
contentHtml: "<p>...</p>\n<h2>...</h2>\n<p>...</p>"
---
```

`contentHtml` is a single HTML string. The body of the MDX file below the frontmatter is currently unused for default-layout pages — the renderer reads `contentHtml` from frontmatter only. See [components/Page.tsx](components/Page.tsx).

## Case-study-layout static page

For services / capabilities pages that need the full case-study visual treatment — gradient hero with brand color tint, label above the title, services list, full-bleed featured image, and auto-numbered `(01)`/`(02)` MainSections with alternating gray/white backgrounds. Use this for pages like Museum Experiences, Drupal Services, Pantheon Hosting — anything that's a top-level capability deserving the same visual weight as a project page.

```yaml
---
title: "..."
slug: "..."                          # unique across content/pages/
date: "YYYY-MM-DDT12:00:00"
layout: case-study
featuredImage:                       # full-bleed hero
  src: "..."
  alt: "..."
  width: 2762
  height: 1480
additionalPostFields:
  label: "Capabilities"              # small text above the title; "Capabilities" or similar — not a client name
  brandColor: "#1a92b8"              # hex; tints the gradient behind the hero
services: ["development", "..."]     # slugs from content/services.yml — same taxonomy as projects
pageSections: [...]                  # ordered MainSection / ImageBlock — same shape as projects
---
```

The same section / voice rules from the project case-study guide apply: lead with the human reality, push tech specs to the back, alternate `white`/`gray` backgrounds, no two grays in a row. Rendered by [components/CaseStudyPage.tsx](components/CaseStudyPage.tsx) → [components/CaseStudyArticle.tsx](components/CaseStudyArticle.tsx) (shared with [components/Post.tsx](components/Post.tsx)).

Unlike project detail pages, case-study-layout *pages* do **not** auto-render a `Featured Projects` block at the bottom. To highlight relevant projects, embed a `FeaturedWork` block in a `MainSection`'s `blocks` array and list the project slugs you want. It renders as a single-line, horizontally-scrolling carousel of `ProjectCard`s **inline in that section's content column** (no dark band, inherits the page background, dark text) — a hand-picked, topic-relevant selection rather than the home page's auto-rotated latest three. Field: `slugs` (required, in display order). Example:

```yaml
- type: MainSection
  tagline: Proof, not promises.
  title: See Our Work
  richText: >
    <p>A short lead-in to recent work.</p>
  blocks:
    - type: FeaturedWork
      slugs:
        - some-project-slug
        - another-project-slug
```

## Lab-project-layout static page

For experiments — a library we're trying, an integration we're prototyping, a technical thing we want to show off. Shorter and more technical than a case study: a brief overview, key code snippets, screenshots, and (optionally) a short screencast. Not for finished client work — use a project case study for that.

Rendered by [components/LabProjectPage.tsx](components/LabProjectPage.tsx) → [components/LabProjectArticle.tsx](components/LabProjectArticle.tsx). Start from [content/pages/lab-project-sample.mdx](content/pages/lab-project-sample.mdx) — it exercises every block type.

> Lab projects can also be authored in Google Docs via Pantheon Content Publisher (phase 1) — and in Microsoft Word once phase 2 ships. See [docs/pantheon-content-publisher-integration.md](docs/pantheon-content-publisher-integration.md) for the design, the ArchieML vs Smart Components trade-off, and the full integration plan.

### Frontmatter shape

```yaml
---
title: "..."                         # H1; the experiment's name
slug: "..."                          # kebab-case; unique across content/pages/
date: "YYYY-MM-DDT12:00:00"
layout: lab-project
featuredImage:                       # optional full-bleed hero (image or diagram)
  src: "/content/images/<slug>/<name>.<ext>"
  alt: "..."
  width: 1600
  height: 900
additionalPostFields:
  label: "Lab Project"               # eyebrow above the title; defaults to "Lab Project"
  tagline: "One-line description..." # short subtitle under the title
  brandColor: "#008ca8"              # hex; tints the gradient behind the hero
  stack:                             # technologies — filled gray chips
    - "Next.js 16"
    - "TypeScript"
  tags:                              # industry/topic keywords — outlined teal chips
    - "Museum"
    - "Experiential"
  repoUrl: "https://github.com/..."  # optional "View repository ↗" link in the header
  liveUrl: "https://..."             # optional "Live demo ↗" link in the header
pageSections: [...]                  # ordered blocks — see below
---
```

### Block types in `pageSections`

All case-study blocks (`MainSection`, `ImageBlock`, `CardGrid`, `ClientQuote`, `FeaturedWork`) work, plus three lab-specific ones:

| Block | Purpose | Key fields |
| --- | --- | --- |
| `MainSection` | Prose section with auto-numbered `(01)`/`(02)` left rail | `tagline`, `title`, `background` (`white` or `gray`), `richText` (HTML string) |
| `ImageBlock` | Screenshots / diagrams | `images: [{src, alt, width, height}]`, `width: "full" \| "text"` |
| `CardGrid` | Grid of titled cards (formats, audiences, features) under a MainSection | `cards: [{title, description?, image?}]`, `columns` (`2`/`3`/`4`, default `3`), `background` |
| `ClientQuote` | Pull-quote or takeaway line | `tagline`, `quote` (HTML), `clientName` |
| `CodeBlock` | Key code snippet in a dark card with filename bar + language pill | `filename` (or `title`), `language` (e.g. `typescript`), `code` (use a YAML `\|` block), `caption` |
| `VideoBlock` | Screencast — Loom, YouTube, or self-hosted MP4 | `provider: loom \| youtube \| file` (auto-inferred from `src` if omitted), `src`, `title`, `caption`, `aspectRatio` (default `16 / 9`), `poster` (for `file`) |
| `TeamProfile` | Who built it — individual or team, with avatar + bio | `kind: individual \| team` (sets eyebrow to "Built by" or "Team"), `name`, `role`, `bio` (HTML or plain), `avatar` (omit for the default outline-cartoon SVG), `links: [{label, url}]` |
| `FeaturedWork` | Curated "recent work" carousel of `ProjectCard`s, hand-picked by slug. **Embed inside a `MainSection`'s `blocks`** (renders inline in the content column); scrolls horizontally | `slugs: string[]` (required, in order) |

### Recommended section arc

Lab projects are short. A typical arc:

1. **TeamProfile** (`kind: individual`) — who built this, up front, to humanize the work.
2. **MainSection** — Overview: what we tried, why it matters, where it could go.
3. **MainSection** — Approach: how the pieces fit together.
4. **CodeBlock** — the smallest snippet that captures the idea. Often pairs with the section just above.
5. **ImageBlock** or **VideoBlock** — show it working.
6. **MainSection** — Next Steps / Limitations.
7. **TeamProfile** (`kind: team`) — optional team credit at the bottom.

Mix and match: a snippet can sit beside a screenshot, a quote can land mid-piece as a pull-out. The auto-numbered rail only counts `MainSection`s, so other blocks don't disrupt the `(01)`/`(02)` flow.

### Voice and structure rules

- **Lead with what you tried, not the framework.** "Drafted in Word, published on the site" beats "We integrated Pantheon Docs with Next.js."
- **Keep snippets tight.** A `CodeBlock` should be the *smallest* code that shows the idea — wrap the rest of the implementation in prose, don't paste whole files.
- **Caption the visuals.** Every `CodeBlock`, `ImageBlock`, and `VideoBlock` reads better with a one-line caption tying it back to the point.
- **One screencast max.** A short Loom is more compelling than three.
- **Be honest about scope.** Lab projects are experiments; "next steps" and "what we'd change" sections are encouraged.

### TeamProfile — virtual personality

The `TeamProfile` block is what gives a lab project its human face. Two configurations:

- **Individual** (`kind: individual`) — eyebrow reads "Built by". Use the person's full name and team area (e.g. "Jason Yarrington" / "Web Solutions").
- **Team** (`kind: team`) — eyebrow reads "Team". Use the team name (e.g. "Experiential Team") and an optional `role` for context.

`avatar` is optional. Omit it and the card renders the default outline cartoon ([components/postBlocks/DefaultAvatar.tsx](components/postBlocks/DefaultAvatar.tsx)) — a side-profile figure at a monitor, drawn in the brand teal. To use a real photo or a custom illustration, set `avatar.src` to any path under `/content/avatars/` (square, ≥ 300×300, will be cropped to a circle).

The `bio` field accepts HTML — use it for one or two short, personable sentences. Don't write a resume; write a personality.

### Authoring in Google Docs via Pantheon Content Publisher

You can also author a lab project in Google Docs and publish it to the site without ever touching the repo. Same rendered output as MDX — just a different surface for editors. (Microsoft Word ships in phase 2.)

**When to pick which:**

- **MDX** — when you need exact control over the markup, when the experiment IS the repo (and the prose lives alongside the code), or when you're iterating fast in a feature branch.
- **PCC** — when the prose dominates the work, when more than one person is editing, or when you want non-developers to publish without merging a PR.

Both kinds coexist; the site merges them at build time and on every webhook revalidation. On a slug collision the MDX file wins and we log a warning.

Pieces involved on the PCC side:

- **Collection:** `lab-projects` (id `NuPhuiula8qj9g0oR9rS`) — every article in this collection is treated as a lab project.
- **Metadata fields** (on the `lab-project` content type) — filled in via the add-on sidebar: `label`, `tagline`, `brandColor`, `stack`, `tags`, `repoUrl`, `liveUrl`, `authoringApproach`. `stack` and `tags` are comma-separated strings.
- **Body** — written in Google Docs, parsed at fetch time. Two options:

#### Option A — ArchieML body

Author types structured key/value markup *inside the doc body*. Best for fast iteration and full control over the section order. Set the article's `authoringApproach` metadata to `archieml`.

Copy-paste this starter into a fresh Google Doc:

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
  Paragraph one of the narrative.

  Paragraph two with **bold** if needed.
:end

type: CodeBlock
filename: lib/pcc.ts
language: typescript
caption: A small typed wrapper around the SDK.
code:
  const PCC_SITE_ID = process.env.PCC_SITE_ID!;
  // …
:end

type: ImageBlock
width: text
imageSrc: https://example.com/screenshot.png
imageAlt: Placeholder screenshot
imageWidth: 1100
imageHeight: 360

type: VideoBlock
provider: loom
src: https://www.loom.com/share/...
caption: Google Docs → publish → live in seconds.

type: ClientQuote
tagline: Takeaway
clientName: — A short one-line conclusion
quote: <p>Lorem ipsum dolor sit amet.</p>

[]
```

ArchieML gotchas — the most common foot-guns:

- **One `[.pageSections]` at the top, blank lines between blocks.** Don't repeat the opener; that creates nested objects instead of siblings. *(Our adapter is forgiving — if you do repeat `[+pageSections]` or `[.pageSections]`, we collapse them — but the canonical form above is cleaner.)*
- **`type:` must be exactly one of:** `MainSection`, `CodeBlock`, `VideoBlock`, `TeamProfile`, `ImageBlock`, `ClientQuote`. Anything else is dropped (and warned in the build log).
- **Multi-line values:** put the colon at end of line, indent the value on the next line(s), and close with `:end` on its own line. Don't put `:end` after the opening colon (that's literal text, not a marker).
- **ImageBlock uses flat fields.** ArchieML can't cleanly express deeply nested arrays inside objects-in-arrays, so use `imageSrc` / `imageAlt` / `imageWidth` / `imageHeight` on the ImageBlock row. The adapter assembles them into the right shape. For multi-image blocks, use MDX (or wait for Phase 1b Smart Components).
- **`[]` closes the array.** End the document with a single line `[]` so the parser knows the array is done.

#### Option B — Smart Components body *(phase 1b, not yet wired)*

Smart Components let authors insert blocks (CodeBlock, VideoBlock, etc.) from the Pantheon add-on sidebar as schema-validated forms. **The schemas live in this repo's code, not in the PCC dashboard** — they're defined in TypeScript as a `SmartComponentMap` and exposed to the Google Docs add-on via a `PantheonAPI` route handler. That route + map don't exist yet; tracking as phase 1b in [docs/pantheon-content-publisher-integration.md](docs/pantheon-content-publisher-integration.md).

Until phase 1b ships, **author PCC lab projects in ArchieML (Option A above).** The fetch pipeline already handles Smart Components when they eventually land — only the authoring side and the PCC-collection-to-API-URL connection are missing.

#### The publish loop

1. **Author** in Google Docs. The Pantheon add-on sidebar shows a live preview rendered against this site.
2. **Preview** — click *Preview* in the add-on. Generates a temporary URL backed by `publishingLevel: REALTIME`. Useful for spot-checking before going live.
3. **Publish** — click *Publish*. PCC marks the article as `PRODUCTION` and fires `article.published` to our webhook at `/api/revalidate`.
4. **Revalidate** — the webhook calls `revalidateTag("pcc:lab-project:<slug>", "max")`. Next request to `/<slug>` refetches from PCC and renders fresh. No rebuild required.

#### How it gets to the site

```
Google Docs → Pantheon Content Publisher  →  /api/revalidate  →  Next.js refetches on next visit
            └─ author body + metadata        └─ HMAC verify        └─ unstable_cache invalidates
```

The wiring lives in [lib/pcc.ts](lib/pcc.ts) (fetch + ArchieML/Slate dispatcher), [lib/content.ts](lib/content.ts) (merge with MDX), and [app/api/revalidate/route.ts](app/api/revalidate/route.ts) (webhook). Background and trade-offs in [docs/pantheon-content-publisher-integration.md](docs/pantheon-content-publisher-integration.md).

#### Phase 2 — Microsoft Word

When the M365 add-in lands in this tenant, authors will be able to write the same lab project in Word. Zero Next.js code changes — both ArchieML body and Smart Components flow through the same PCC API.

## Image conventions

**Storage.** Organize by **theme or page**, not by date.

- **Per-page** (preferred when an image is scoped to a single page):
  `public/content/images/<project-or-page-slug>/<descriptive-name>.<ext>`
  Reference in frontmatter as `/content/images/<slug>/<descriptive-name>.<ext>`.
- **Per-theme** (when an image is reused across pages):
  `public/content/images/<theme>/<descriptive-name>.<ext>` (e.g., `team/`, `brand/`, `events/`).

The legacy `public/content/images/YYYY/MM/` folders are leftovers from the WordPress migration. Leave existing files where they are; do not reorganize them. New images only follow the new convention.

**Required fields.** Every image must include `width` and `height` in frontmatter — Next.js needs them to reserve layout space and prevent CLS.

**Alt text.**
- Descriptive, not redundant. Don't write "Image of …" or "Photo of …".
- End with a period.
- For decorative gradient/brand pieces, describe the visual, not the meaning.

**Sizing.**
- Featured/card hero: roughly 16:9, ≥1600px wide.
- Inline ImageBlock images: full-bleed at the section width — provide at least 1440px wide.
- All images compress before commit (no 5MB hero JPGs).

**Placeholders for missing images.**

When drafting a page or case study before the real image exists, set `placeholder: true` on the image instead of pointing at a file that isn't on disk. The renderer ([components/postBlocks/PlaceholderImage.tsx](components/postBlocks/PlaceholderImage.tsx)) draws a light-gray block at the declared aspect ratio with the alt text — and, if provided, designer notes — visible in place. Works for `featuredImage`, `cardImage`, and any image inside an `ImageBlock`.

```yaml
featuredImage:
  src: ""                              # leave empty (or use the eventual path)
  alt: "Three authoring surfaces converging on a single rendered page."
  width: 2880
  height: 1614
  placeholder: true
  notes: "Hero composite: code editor on the left, Google Doc center, Claude Code prompt on the right; light gradient background in brand teal."
```

Inside an `ImageBlock`:

```yaml
- type: ImageBlock
  images:
    - src: ""
      alt: "Flow diagram — Google Doc to PCC to webhook to Next.js refetch."
      width: 1600
      height: 900
      placeholder: true
      notes: "Four-step horizontal flow; arrows in brand teal; monospace labels."
```

When the real image lands: drop the file on disk, set `src` to the path, and remove `placeholder` and `notes`. Real images and placeholders can coexist in the same draft — the renderer picks per image.

## Service taxonomy

The `services` field on a project is an array of slugs from [content/services.yml](content/services.yml). **Always read that file fresh before drafting** — the list evolves, and the user adds and renames services as needed. Never invent slugs that aren't in the file. If a project needs a service that's not yet listed, surface it and ask before adding a new entry.

## Editorial workflow

Drafts move through five states — `draft` → `review` → `revisions` → `approved` → `live` — tracked in an optional top-level `editorial:` block in MDX frontmatter:

```yaml
editorial:
  status: review              # draft | review | revisions | approved | live
  branch: content-review      # feature branch the change rides on
  pr: 42                      # PR number
  updated: 2026-05-11
  reviewers: ["..."]          # optional
  notes: "..."                # optional, single-line ask from reviewer
```

The block is declared as the `Editorial` interface in [lib/types.ts](lib/types.ts) and consumed by [components/DraftStatusToast.tsx](components/DraftStatusToast.tsx) — a fixed bottom-right toast rendered on every `draft: true` project case study and lab project, showing the current status with click-through to the PR. When a piece reaches `live`, **remove the `editorial` block entirely** (and `draft: true`) — production MDX stays clean. State transitions are driven by the `/workflow` skill ([.claude/commands/workflow.md](.claude/commands/workflow.md)), which also handles the Pantheon push (branch + PR via [scripts/deploy-feature-branch.sh](scripts/deploy-feature-branch.sh)).

**Environment-aware visibility.** On any environment other than Live (multidev, test, dev, local), `draft: true` projects appear in the home-page featured block, `/our-work`, and the sitemap so reviewers can browse drafts on a multidev URL. On Live, drafts are hidden from those surfaces; only direct URLs resolve (with `noindex`). The same `draft?` field is also recognized on lab-project Pages.

## Pre-publish checklist

Before declaring a draft ready, walk through this list:

1. **Slug unique** — confirm `<slug>` doesn't already exist in `content/projects/` or `content/pages/`.
2. **Frontmatter validates** — every required field on the `Project` (or `Page`) interface is present; no invented fields.
3. **Images on disk** — every `src` referenced in frontmatter exists under `public/`; the `width` and `height` match the actual file dimensions.
4. **Service slugs valid** — every entry in `services` is present in `content/services.yml`.
5. **Background alternation** — no two `gray` MainSections in a row.
6. **`npm run build` passes** — the production build catches frontmatter shape errors, missing images, and TypeScript regressions that `npm run dev` lets through. Run it before handing off.
7. **Visual spot check** — `npm run dev` and review the page in a browser per the design-session five-point check in [DESIGN.md](DESIGN.md).
