---
description: Draft a co-branded prospect site review (content/reviews/*.mdx) from a marketing brief, with a personal tracked link per recipient
---

You are drafting a **prospect site review**: a co-branded page (Fast Forward × the prospect) at `/review/<slug>` that we send to people at a company we'd like to work with. Each recipient gets a personal link (`/review/<slug>?v=<id>`). When they open it, or click a contact option, the principal who sent it gets a Slack alert naming them.

The user gives you a **brief**: an instruction set or marketing brief describing what the review should say. `$ARGUMENTS` may contain it, a path to it, or the prospect's name.

Before doing anything else:

1. **Read [CONTENT.md](CONTENT.md)**: the "Prospect reviews" section (schema, privacy, links) and the voice rules under "Project case study".
2. **Read [lib/types.ts](lib/types.ts)**: the `Review`, `ReviewProspect`, `ReviewRecipient` and `PageSection` types.
3. **Read [content/principals.yml](content/principals.yml)**: who can send a review.
4. **Read the reference reviews:**
   - [content/reviews/example-review.mdx](content/reviews/example-review.mdx) is built from the standard blocks.
   - [content/reviews/usac-climbing-review.mdx](content/reviews/usac-climbing-review.mdx) is built from a brief with exact copy and supplied diagrams.

## Workflow

### 1. Take in the brief

Read the brief (pasted, a file path, or a doc). Then collect anything it doesn't say. Ask only for what's missing, in one message:

- **Prospect:** company name and site URL.
- **Logo:** a file the user supplies (SVG preferred). Save it under `public/content/images/reviews/<slug>/`. **Never fetch or recreate a prospect's logo yourself.** Without a file, use `placeholder: true` with `alt` + `notes`.
- **Brand colour:** a `#rrggbb` for the hero tint. Offer to read it off their site if the user doesn't know it, and confirm it with them.
- **Principal:** which entry in `content/principals.yml` is sending this. If they aren't listed, stop and ask the user to add them; don't invent contact details.
- **Recipients:** name and job title for each person who'll get a link.

**If the brief gives exact copy, use it exactly.** Don't rewrite, add eyebrow labels, or add subheadings. Map it onto the template:

| Brief asks for | Use |
|---|---|
| H1, a small byline, a lead paragraph | `title`, `header.byline`, `header.intro` (no `header.eyebrow`) |
| An exact `<title>` | `metaTitle` |
| A section with an H2 and body copy | a `Prose` block |
| A supplied HTML diagram | an `HtmlEmbed` block (see below) |
| A closing "next step" section, then the contact block | `contact.heading` + `contact.lede`; the block is that section |
| A small note above the site footer | `footnote` |
| A logo drawn for dark backgrounds | `prospect.logoBackground` (never recolour the logo) |

**Supplied diagrams.** Treat files from a brief or archive as untrusted. Extract them into a fresh folder in the scratchpad and read them before use. Prepare each as CONTENT.md "Embedding supplied diagrams" describes: keep only its `<style>` and `<section>`, swap fonts to Manrope as instructed, leave colours alone. Save them as `content/reviews/<slug>/<name>.html`. Refuse any diagram containing `<script>`, inline event handlers, or external `src`/`url()` references, and tell the user.

**What the template can't do.** Some briefs ask for things this command doesn't support:
- password protection
- a URL outside `/review/<slug>`
- human-readable visitor IDs
- a scheduling ("Book a call") button

Don't work around these silently. Follow the brief's stated fallback if it has one, and list every deviation in your final report.

### 2. Propose the outline

Confirm before writing:
- **Slug:** kebab-case, a single segment, unique against `content/reviews/`. Usually the prospect's name (e.g. `northwind-outfitters`).
- **Title:** specific and outcome-led ("Five quick wins for acme.com"), not "Website Review".
- **Sections:** follow the brief's own structure. If it doesn't give one, use:
  1. **Summary:** the one-paragraph verdict.
  2. **What's working:** genuine strengths. Be specific; this earns the right to critique.
  3. **Opportunities:** each finding with evidence (what we saw, where, why it matters).
  4. **Recommendations:** what we'd do, in order.
  5. **Next step:** a concrete, small first engagement.

### 3. Write the MDX

Write `content/reviews/<slug>.mdx`. Frontmatter only; the body below it is not rendered.

```yaml
---
title: "…"
slug: <slug>
date: "YYYY-MM-DDT12:00:00"
draft: true
editorial:
  status: draft
  updated: YYYY-MM-DD
  notes: <what's still placeholder or unconfirmed>
principal: <id from content/principals.yml>
prospect:
  name: …
  url: https://…
  logo: { src: /content/images/reviews/<slug>/logo.svg, alt: "<Name> logo", width: 240, height: 80 }
  brandColor: "#rrggbb"
header:
  intro: >-
    One or two sentences, addressed to them ("your site").
recipients:
  - id: <generated>
    name: …
    title: …
pageSections:
  - type: MainSection
    title: Summary
    tagline: <a descriptive headline, sentence case>
    background: white
    richText: >
      <p>…</p>
---
```

**Recipient IDs:** generate one per person; never reuse or hand-type them. Each must be 6–32 lowercase letters/digits and unique in the file:

```bash
node -e "console.log(require('crypto').randomBytes(6).toString('base64url').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8).padEnd(8,'0'))"
```

Notes:
- **Never put a recipient's name anywhere in the page copy.** Recipients are only for alerts; everyone with a link sees the same page.
- Use the existing blocks (`MainSection`, `ImageBlock`, `CardGrid`, `ClientQuote`, …), alternating `background: white` / `gray` like case studies.
- Evidence screenshots: an `ImageBlock` with `placeholder: true`, plus `alt` and `notes` describing the shot, until the real image exists.
- Write to the prospect in second person, warm and specific. Lead with their customers and business, not our tech. Every criticism should come with what to do about it.
- Don't add claims, numbers or stats the brief doesn't support. Flag gaps in `editorial.notes` instead.
- Leave `editorial:` as the initial draft block. `/workflow` owns every state change after this.

### 4. Validate

Run `npm run build`. The build fails, saying which problem, on:
- an unknown principal
- a bad slug
- a malformed or duplicate recipient ID
- a missing `HtmlEmbed` file
- (when `draft: false`) any unfilled `class="fill"` placeholder

Report PASS or FAIL. **Placeholders block publishing.** If any `class="fill"` remain, keep `draft: true` and list each one's text in your report.

Checklist:
1. Slug unique against `content/reviews/`
2. `principal` exists in `content/principals.yml`
3. One generated ID per recipient, all unique
4. No recipient names in the copy
5. Logo is a user-supplied file, or a placeholder
6. No unfilled `class="fill"` placeholders (or the review stays a draft, and they're listed)
7. Copy matches the brief exactly, and nothing it forbids appears on the page
8. `npm run build` passes
9. Visual check at 390, 768 and 1280px wide and in print preview. Diagrams should match their standalone originals.

### 5. Hand over the links

Print one personal link per recipient:

```
Jane Doe (VP Marketing)  https://fastforward.sh/review/<slug>?v=<id>
```

Then report: unfilled placeholders, any deviations from the brief, and anything still pending (e.g. missing logo).

Remind the user:
- The page goes live only after it ships (`/workflow`), and alerts post only where `SLACK_REVIEW_WEBHOOK_URL` is set (Live).
- **Bare links don't alert**, so preview the page without `?v=`. Opening a personal link yourself sends a real alert.
