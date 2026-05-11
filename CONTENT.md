# Content authoring guide

You are helping draft new content for **Fast Forward** (`fastforward.sh`). Read this guide before writing any new MDX or YAML in `content/`.

The schema is the source of truth. Always check [lib/types.ts](lib/types.ts) before drafting — never invent frontmatter fields. If you need a field that doesn't exist, surface it and ask before adding.

## Content types we author today

| Type | Location | Schema | Reference exemplar |
| --- | --- | --- | --- |
| Project case study | `content/projects/<slug>.mdx` | `Project` in [lib/types.ts](lib/types.ts) | [content/projects/growing-with-pantheon.mdx](content/projects/growing-with-pantheon.mdx) |
| Default-layout static page | `content/pages/<slug>.mdx` (`layout: default`) | `Page` in [lib/types.ts](lib/types.ts) | [content/pages/accessibility.mdx](content/pages/accessibility.mdx) |
| Case-study-layout static page | `content/pages/<slug>.mdx` (`layout: case-study`) | `Page` in [lib/types.ts](lib/types.ts) | [content/pages/museum-experiences.mdx](content/pages/museum-experiences.mdx) |

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

**`ImageBlock`** — one or two side-by-side images. Use to break rhythm between long copy sections, especially after dense MainSections. Each image needs `src`, `alt`, `width`, `height`.

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

Unlike project detail pages, case-study-layout *pages* do **not** auto-render a `Featured Projects` block at the bottom — curate a "Recent Work" MainSection inside `pageSections` if you want to highlight relevant projects, so the selection is topic-relevant rather than auto-rotated.

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

The block is parsed by `gray-matter` but not declared in [lib/types.ts](lib/types.ts), so the renderer ignores it. When a piece reaches `live`, **remove the `editorial` block entirely** — production MDX stays clean. State transitions are driven by the `/workflow` skill ([.claude/commands/workflow.md](.claude/commands/workflow.md)), which also handles the Pantheon push (branch + PR via [scripts/deploy-feature-branch.sh](scripts/deploy-feature-branch.sh)).

## Pre-publish checklist

Before declaring a draft ready, walk through this list:

1. **Slug unique** — confirm `<slug>` doesn't already exist in `content/projects/` or `content/pages/`.
2. **Frontmatter validates** — every required field on the `Project` (or `Page`) interface is present; no invented fields.
3. **Images on disk** — every `src` referenced in frontmatter exists under `public/`; the `width` and `height` match the actual file dimensions.
4. **Service slugs valid** — every entry in `services` is present in `content/services.yml`.
5. **Background alternation** — no two `gray` MainSections in a row.
6. **`npm run build` passes** — the production build catches frontmatter shape errors, missing images, and TypeScript regressions that `npm run dev` lets through. Run it before handing off.
7. **Visual spot check** — `npm run dev` and review the page in a browser per the design-session five-point check in [DESIGN.md](DESIGN.md).
