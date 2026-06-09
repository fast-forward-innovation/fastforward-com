---
description: Edit an already-started page — pick it, edit a block, fill image placeholders, add/remove/reorder blocks, update frontmatter, or do a full rewrite from a new creative brief (content/pages + content/projects)
---

You are helping a content editor **update a page that already exists** on `fastforward.sh` —
a static page, a pillar/experiences/digital page, a blog post, or a project case study. The
goal is to make editing conversational: the editor picks the page, sees a readable map of its
blocks, and changes one thing at a time. They should never have to know the file path, the
block schema, or YAML indentation rules.

`$ARGUMENTS`, if present, is a hint at which page to open (a slug or title fragment).

Before doing anything else:

1. **Read [CONTENT.md](CONTENT.md)** — the source of truth for schema, voice, block authoring
   rules, and the placeholder-image convention.
2. **Read [lib/types.ts](lib/types.ts)** — confirm the current `Page`, `Project`,
   `PageSection`, and `FrontmatterImage` shapes before you change anything.

## Two content shapes — detect which one this page uses

- **Block pages** drive their body from a `pageSections:` array. Used by `case-study`,
  `pillar-page`, `lab-project`, `blog-case-study`, and most projects. These have editable
  **blocks**.
- **Prose pages** drive their body from a single `contentHtml:` HTML string. Used by `default`
  and `blog` layouts. These have **no blocks** — you edit the HTML prose and the
  `featuredImage`.

Some files carry both keys; for a block layout, `pageSections` is what renders. Branch on what
the layout actually uses.

## Workflow

### 1. Pick the page

- Search `content/pages/**/*.mdx` and `content/projects/*.mdx`.
- If `$ARGUMENTS` is given, fuzzy-match it against slug and title. On a single hit, use it; on
  several, list the matches and ask.
- If no argument, list candidates grouped so they're easy to scan — **Pages**, **Experiences**
  (`pages/experiences/`), **Digital** (`pages/digital/`), **Blog** (`pages/blog/`),
  **Projects** (`content/projects/`) — and ask which one.
- Confirm the choice by echoing one line: **title · slug · layout · draft? · editorial status**.

### 2. Show the page map

Parse the frontmatter, then:

- **Block page** — print a numbered outline, one line per top-level block:
  `#. <type> — <title | tagline | first meaningful label>`. Flag any block that contains
  placeholder images, e.g. `[2 placeholders]`. Call out nested `blocks:` (a `CardGrid` or
  `FeaturedWork` living inside a `MainSection`).
- **Prose page** — say it's a single-column HTML page; offer to edit the prose (by
  section/heading) and the `featuredImage`. The block operations below don't apply.

Also report frontmatter-level images — `featuredImage`, and `cardImage` on projects — and
whether each is a placeholder.

### 3. Choose an operation

Ask what they want to do (use `AskUserQuestion`):

1. **Edit a block** — pick a number.
2. **Fill an image placeholder.**
3. **Add a block.**
4. **Remove or reorder blocks.**
5. **Edit frontmatter** (title, tagline/label, `featuredImage`, `draft`, …).
6. **Full rewrite from a new creative brief** — replace the whole body.

After any operation, go to **Validate**, then offer to loop back to this menu.

The first five are surgical, single-block edits. Reach for **Full rewrite** only when the
editor wants to redo the page wholesale against a new brief — not for a copy tweak.

### 3a. Edit a block

- Show the current YAML of **just that block**, and which fields are valid for its `type` (from
  [lib/types.ts](lib/types.ts); authoring guidance in [CONTENT.md](CONTENT.md)).
- Ask what to change, then apply a **scoped edit to that block only** — preserve the
  surrounding indentation and leave every other block byte-for-byte unchanged. Never reflow or
  rewrite untouched content.
- `MainSection.richText` is **inline HTML** (`<p>`, `<strong>`, `<em>`, `<ul>`, `<a>`), not
  Markdown. Keep it that way.

### 3b. Fill an image placeholder

- Enumerate every image in the page with `placeholder: true` — frontmatter images, images in
  any block, and images on nested cards. Label each by location + `alt` + `notes` +
  declared `width`×`height` so the editor knows which one is which.
- The editor picks one and provides the image: a path on disk (e.g. `~/Downloads/x.png`) or an
  existing file already under `public/`.
- Place or confirm the file under `public/content/images/<sensible-subdir>/<filename>` (heroes
  may use `public/hero-images/`). Pick a subdir/filename that matches the page or topic.
- Detect real pixel dimensions: `sips -g pixelWidth -g pixelHeight <file>`. Set `width` and
  `height` to those values.
- Set `src` to the root-absolute path **without** the `public/` prefix — e.g.
  `src: /content/images/2023/09/foo.png`. Keep or refine `alt`, and **delete the `placeholder`
  and `notes` keys.** Filled images and remaining placeholders can coexist in the same page —
  fill one at a time.

### 3c. Add a block

- Ask for the block `type` and where it goes (which position in `pageSections`).
- Insert a minimal **valid** block: include the required fields for that type from
  [lib/types.ts](lib/types.ts), and follow [CONTENT.md](CONTENT.md) guidance — e.g. prefer
  embedding a `CardGrid` inside the owning `MainSection`'s `blocks` array rather than as a
  standalone section.
- Any new image starts as `placeholder: true` with `alt` + `notes` and declared `width`/`height`,
  so real art can land later via **Fill an image placeholder**.

### 3d. Remove or reorder blocks

- Show the numbered outline, confirm the exact removal or the new order, then re-emit the
  `pageSections` array in the new order.
- **Require an explicit confirmation before deleting** a block.

### 3e. Edit frontmatter

- Edit metadata fields: `title`, `additionalPostFields` (label, tagline, stack, tags, …),
  `featuredImage`, `draft`, etc.
- **Do not touch the `editorial:` block** — that state is owned by the `/workflow` skill. If
  the editor wants to change review status or ship the page, point them at `/workflow`.

### 3f. Full rewrite from a new creative brief

A wholesale rebuild of the page body against a new brief, while keeping the page's **identity**.
This is the heavy operation — confirm the editor actually wants to replace the whole body, not
edit a section, before you start.

**Preserve, don't regenerate:** `slug`, `layout`, `date`, `draft`, the `editorial:` block,
`services`, and `pccArticleId`/`source` if present. The rewrite changes the body
(`pageSections` or `contentHtml`) and the body-adjacent frontmatter (`title`, `additionalPostFields`
tagline/label, `featuredImage`) — nothing about where the page lives or its workflow state.

1. **Take the brief.** Ask the editor to paste it inline or point you at a file/URL, and read
   it. If anything material is missing for a strong page, ask follow-ups before drafting — same
   gaps the `/new-project` skill probes for (who it's for, the real editorial/business problem,
   options considered, what changed in the end). If this is a project case study, also re-read
   [content/services.yml](content/services.yml) for the current service slugs.
2. **Inventory what already exists** and is worth keeping. Before throwing the body away, list
   the page's **filled (non-placeholder) images** and any blocks the brief clearly still wants.
   Ask the editor, per real image, whether to **reuse** it (keep `src`/dimensions/alt) or drop
   it. Don't silently discard art that's already been produced.
3. **Propose the new structure and get approval before writing.** Mirror `/new-project` step 2:
   list the new `pageSections` outline (block types in order with their `title`/tagline labels
   and `white`/`gray` backgrounds), or, for a prose page, the new `<h2>` section outline. Note
   which images are reused vs. new placeholders. Wait for approval or edits.
4. **Write the new body.** Replace `pageSections` (or `contentHtml`) wholesale, conforming to
   the `Page`/`Project` shape in [lib/types.ts](lib/types.ts) and the voice/structure/HTML
   rules in [CONTENT.md](CONTENT.md) — same standard the `/new-page` and `/new-project` skills
   hold new content to. Reused images keep their real `src`; every new image need becomes
   `placeholder: true` with `alt` + `notes` + declared `width`/`height`, to be filled later via
   **Fill an image placeholder**.
5. List the placeholders you left so the editor knows what art is still pending, then go to
   **Validate**.

### 4. Validate

- Run `npm run build`. Report **PASS** or **FAIL** with line numbers if anything breaks.
- Offer a visual spot check: `npm run dev`, then view the page's route.
- Ask whether they want to make another edit (back to the menu) or stop.

## Guardrails

- Edit **only** the chosen page's `.mdx` (and, for a fill, copy an image into `public/`).
- Don't modify `AGENTS.md`, `CLAUDE.md`, other skills, or any component code.
- Don't write `editorial:` state — defer to `/workflow`. This skill edits the file; it does not
  review, deploy, or change workflow status.
- Keep every edit scoped and indentation-valid; never reflow or rewrite blocks you weren't asked
  to change.

## Reference exemplars

- [content/pages/experiences/immersive-environments.mdx](content/pages/experiences/immersive-environments.mdx)
  — `ZigZag` + a `CardGrid` embedded in a `MainSection`, with placeholder card images.
- [content/projects/](content/projects/) — block-heavy case studies.
- [content/pages/accessibility.mdx](content/pages/accessibility.mdx) — a prose/`contentHtml` page.
- [components/postBlocks/PlaceholderImage.tsx](components/postBlocks/PlaceholderImage.tsx) — how
  placeholders render.
