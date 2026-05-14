---
description: Draft a new default-layout static page (content/pages/*.mdx)
---

You are helping draft a new default-layout static page for `fastforward.sh` — pages like About, Approach, Process, Privacy, Accessibility. Anything that's a single column of prose without the case-study structure.

Before doing anything else:

1. **Read [CONTENT.md](CONTENT.md)** — the source of truth for schema, voice, and conventions.
2. **Read [lib/types.ts](lib/types.ts)** — confirm the current `Page` interface shape.
3. **Skim [content/pages/accessibility.mdx](content/pages/accessibility.mdx)** — the canonical exemplar for default-layout pages.

## Important: landing pages are not yet supported

If the user is asking for a **campaign / marketing landing page**, stop and tell them this:

> The `layout: landing` template ([components/LandingPage.tsx](components/LandingPage.tsx)) currently has its hero copy, three feature cards, and CTA hard-coded in JSX — they are not driven by frontmatter. Until that component is refactored to read from frontmatter, a `layout: landing` page will not render the campaign-specific content.
>
> Options:
> - **Use `layout: default`** — if your campaign page is mostly long-form copy, the default layout works today.
> - **Refactor LandingPage first** — if you need the hero / features structure, that's a coding task before the content task.

Confirm which path the user wants before continuing.

## Workflow

### 1. Pick a mode

Ask:

> Do you want to work from a **brief** (paste notes / point me at a doc) or an **interview** (I'll ask you the questions)?

### Brief mode
Read the brief. Ask follow-ups for any material gaps before drafting.

### Interview mode
Ask, one at a time:

1. **What's the page for?** Audience, purpose, where it sits in the site (footer link? top-level nav? linked from elsewhere?).
2. **Slug.** What URL path? (kebab-case; verify uniqueness against `content/pages/`.)
3. **Outline.** What sections / headings does it need?
4. **Body content.** Walk through each section.
5. **Featured image** (optional)? If yes, source path and dimensions.

### 2. Propose a structure

Before writing, confirm:
- **Slug** (verified unique against `content/pages/`)
- **Section outline** (`<h2>`s and what's under each)

### 3. Write the MDX

Write `content/pages/<slug>.mdx` with this frontmatter shape:

```yaml
---
title: "..."
slug: "..."
date: "YYYY-MM-DDT12:00:00"
layout: default
contentHtml: "<p>...</p>\n<h2>...</h2>\n<p>...</p>"
---
```

Notes:
- `contentHtml` is a single HTML string. Use `\n` between blocks.
- The body of the MDX file below the frontmatter is **not rendered** for default-layout pages — see [components/Page.tsx](components/Page.tsx). All content goes inside `contentHtml`.
- Use semantic HTML: `<p>`, `<h2>` (the page title is `<h1>` from the renderer; start subheads at `<h2>`), `<ul>`/`<ol>`, `<a>`, `<strong>`, `<em>`.
- Don't use `<dl class="verdict-list">` here — that's a case-study-only pattern.

### 4. Validate

Run `npm run build`. Report PASS or FAIL with line numbers if anything breaks.

Walk the user through the simplified pre-publish checklist:

1. Slug unique against `content/pages/`
2. Frontmatter validates against `Page` (in `lib/types.ts`)
3. `layout: default` set
4. `contentHtml` is well-formed HTML (no unclosed tags)
5. `npm run build` passes
6. Visual spot check pending in `npm run dev`
