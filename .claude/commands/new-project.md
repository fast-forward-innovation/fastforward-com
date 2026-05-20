---
description: Draft a new project case study (content/projects/*.mdx) from a brief or interview
---

You are helping draft a new project case study for `fastforward.sh`. Before doing anything else:

1. **Read [CONTENT.md](CONTENT.md)** — the source of truth for schema, voice, structure, and image conventions.
2. **Read [lib/types.ts](lib/types.ts)** — confirm the current `Project` interface shape.
3. **Read [content/services.yml](content/services.yml)** — confirm the current service slug list (it changes; never use a stale snapshot).
4. **Skim [content/projects/growing-with-pantheon.mdx](content/projects/growing-with-pantheon.mdx)** — the canonical voice/structure exemplar.

Then run this workflow:

## 1. Pick a mode

Ask the user:

> Do you want to work from a **brief** (paste notes / point me at a doc) or an **interview** (I'll ask you the questions)?

Wait for the answer before proceeding.

### Brief mode

Ask the user to paste the brief inline or point you at a file/URL. Read it. If anything material is missing for a strong case study, ask follow-up questions before drafting. Material gaps usually include: who the client was, what the editorial/business problem actually was (not the tech problem), what alternatives were rejected and why, and what changed for the customer in the end.

### Interview mode

Walk through these questions one at a time. Wait for each answer before moving on.

1. **The Challenge** — What was the customer actually trying to do, and what was getting in the way? Frame this in human/editorial/business terms, not tech.
2. **Options on the table** — What alternatives did we (or the customer) consider? Aim for 2–3 distinct options.
3. **What we picked, and why** — Which option won, and what made it the right fit?
4. **The Stack** — Briefly: what's underneath the solution? Frame in service of the editorial/business outcome.
5. **How We Built It** — What was the actual build process? Tools, decisions, what failed, what didn't.
6. **The Result** — What changed for the customer in plain language?
7. **The one-line lesson** — What's the single takeaway sentence?
8. **Services** — Which services from `content/services.yml` apply? List the current slugs to choose from.
9. **Client/campaign label** (optional) — Short label that sits above the title (e.g., "Fast Forward Innovation").
10. **Brand color** (optional) — Hex code that tints the hero gradient.

## 2. Propose a structure

Before writing, propose:

- A **slug** (kebab-case; verify it isn't already in `content/projects/`)
- The **`pageSections` outline** — list the block types in order with their `title` labels, e.g.:
  > 01. MainSection — "The Challenge" (white)
  > 02. ImageBlock — 1 image
  > 03. MainSection — "The Approach" (white) [includes verdict-list]
  > 04. MainSection — "The Stack" (white)
  > 05. ImageBlock — 1 image
  > 06. MainSection — "How We Built It" (gray)
  > 07. ImageBlock — 1 image
  > 08. MainSection — "The Result" (white)
  > 09. MainSection — "Behind the Curtain" (gray)
- The **service slugs** that fit (from the live `services.yml`)

Get the user's approval (or edits) before writing.

## 3. Write the MDX

Write `content/projects/<slug>.mdx` with the agreed structure. Conform to:

- The `Project` interface in `lib/types.ts` — every required field present, no invented fields.
- The voice rules in CONTENT.md — lead with the human reality; tech specs in "Behind the Curtain"; tagline = sentence-case headline; title = Title Case short label; alternate `white`/`gray` backgrounds.
- Special HTML patterns from CONTENT.md where they fit: `<dl class="verdict-list">` for option comparisons; `<strong>` for product/brand names and the closing lesson; `<code>` for filenames/commands.

## 4. Image guidance

After writing the MDX, remind the user:

- New images go under `public/content/images/<slug>/<descriptive-name>.<ext>` (per-page) or `public/content/images/<theme>/<...>` if reused across pages.
- Required sizes: featured/card hero ≈ 16:9 at ≥1600px wide; ImageBlock images ≥1440px wide.
- Frontmatter `width`/`height` must match the actual file dimensions.
- Compress before commit.

**When the real image doesn't exist yet, use a placeholder.** Set `placeholder: true` on the image (works on `featuredImage`, `cardImage`, and any image inside an `ImageBlock`) and the renderer draws a light-gray block at the declared aspect ratio with the alt text on it. Add a `notes:` string for designer guidance — what the final image should depict, composition, palette, anything useful for whoever produces it. Always include `width`/`height` so the placeholder reserves the right space. See the Placeholders section in [CONTENT.md](CONTENT.md) for the exact shape. List the placeholders you used in your handoff to the user so they know what's still pending.

## 5. Validate

Run `npm run build`. Report PASS or FAIL with line numbers if anything breaks. If the build fails because images are missing, that's expected for a draft — note it and continue.

Also walk through the **pre-publish checklist** from CONTENT.md:

1. Slug unique
2. Frontmatter validates against `Project`
3. Images on disk; dimensions match frontmatter
4. Service slugs all present in `services.yml`
5. No two `gray` MainSections in a row
6. `npm run build` passes
7. Visual spot check pending in `npm run dev`
