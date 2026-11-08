---
name: writing-style
description: Fast Forward's house language rules for any copy we write or edit (pages, blog posts, case studies, reviews, reports, captions, alt text, SEO descriptions). Use whenever drafting or revising prose for fastforward.sh or a client deliverable. American spelling, no em or en dashes, no triplets, 8th grade reading level with UX and developer jargon allowed.
---

# Fast Forward writing style

Apply these rules to every piece of prose we produce: page copy, blog posts,
case studies, reviews, reports, captions, alt text, and SEO descriptions.
They also apply when editing someone else's draft, but **keep the author's
own wording where it already follows the rules**. Fix what breaks a rule and
leave the rest alone.

## 1. American spelling only

No British spellings. Common ones to catch:

| British | American |
|---|---|
| colour, favour, behaviour, labour, honour | color, favor, behavior, labor, honor |
| organise, optimise, prioritise, recognise, customise | organize, optimize, prioritize, recognize, customize |
| organisation, optimisation | organization, optimization |
| analyse, catalogue, dialogue | analyze, catalog, dialog (UI) |
| centre, metre, theatre | center, meter, theater |
| licence (noun), defence, offence | license, defense, offense |
| modelled, travelled, cancelled, labelled | modeled, traveled, canceled, labeled |
| programme | program |
| grey | gray |
| whilst, amongst, learnt | while, among, learned |

Leave proper nouns and quoted text alone (a product or organization's own
name, a direct quote, a code identifier such as a CSS property).

## 2. No em dashes or en dashes

Never use `—` (em dash) or `–` (en dash) in prose, including their HTML
entities `&mdash;` and `&ndash;`. Rewrite the sentence instead:

- Split it into two sentences.
- Use a comma, a colon, or parentheses.
- For ranges, write "to": "K to 12", "2019 to 2026", "48% to 55%".

> Before: The site was fast — really fast — on any connection.
> After: The site was fast on any connection. Really fast.

A plain hyphen in a compound word ("static-first", "K-12") is fine.

## 3. No triplets

Don't reach for lists of three as a rhythm device: three adjectives, three
parallel phrases, or three short punchy sentences in a row. It reads as
filler and as machine-written.

> Before: The new site is faster, simpler, and easier to maintain.
> After: The new site is faster, and editors can update it without us.

> Before: We listened. We learned. We built.
> After: We spent the first two weeks listening to teachers before we built anything.

Pick the one or two points that matter and say something specific about
them. A real list of three facts is fine when there are exactly three things
(three options we weighed, three services in a stack). The rule targets
rhetorical triplets, not honest counts.

## 4. 8th grade reading level

Write so a 13-year-old could follow the sentences, even if they don't know
every technical term.

- Short sentences. Aim for 15 to 20 words on average, and break up anything
  over 30.
- One idea per sentence. One topic per paragraph.
- Everyday words over formal ones: "use" not "utilize", "help" not
  "facilitate", "start" not "commence", "about" not "approximately".
- Active voice: "We rebuilt the search" not "The search was rebuilt".
- Cut filler: "in order to", "it's worth noting that", "leverage",
  "robust", "seamless", "cutting-edge".

**Jargon is allowed.** Our readers are clients and peers in UX and web
development, so terms like CDN, TTFB, static-first, server-rendered,
component library, design system, user journey, and Lighthouse score can
stay. Keep the sentences around them simple. Spell out an acronym the first
time when a non-technical client is the main reader.

## Checking a draft

Before handing copy back, scan it for dashes and the most common British
spellings:

```bash
grep -nE '—|–|&mdash;|&ndash;' <file>
grep -niE '\b(colour|favour|behaviour|(organ|optim|priorit|recogn|custom)is(e|ed|es|ing|ation)|analys(e|ed|ing)\b|centre|licence|modelled|travelled|cancelled|labelled\b|programme|grey|whilst|amongst|learnt)' <file>
```

`aria-labelledby` and similar code identifiers are not prose; ignore them.
Then reread for triplets and long sentences by eye. In HTML or MDX, only
the prose counts. Ignore code, URLs, class names, and frontmatter keys.

When you edit a draft against these rules, tell the user briefly what kind of
changes you made (for example "swapped 3 British spellings, removed 2 em
dashes") so they can check them.
