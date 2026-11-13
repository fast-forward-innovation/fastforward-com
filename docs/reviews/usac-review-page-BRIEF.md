# Page build brief: USA Climbing member journey review

**For:** the Fast Forward website page-builder skill
**Requested by:** Jason Yarrington
**Date:** November 2, 2026

## 1. Page settings

| Setting | Value |
|---|---|
| URL | `https://fastforward.sh/private/usac-climbing-review` |
| Page title (HTML `<title>`) | USA Climbing member journey review – Fast Forward |
| Indexing | `<meta name="robots" content="noindex, nofollow">` |
| Sitemap | Exclude this page from the sitemap and from all site navigation, search and listings |
| Access | Password-protect the page if the skill supports it. If not, rely on noindex and the unlisted URL. |
| Social preview | Do not add Open Graph or Twitter preview images |
| Analytics | Use only the skill's tracking link. No other third-party scripts. |

## 2. Tracking link

- Create one recipient-specific tracking link for **Jarek Elmasian, Director of Marketing & Communications, USA Climbing**.
- Use a recipient identifier that doesn't reveal personal data, for example `usac-je`.
- **Return the final tracking URL in your output.** Jason will paste it into the intro email in place of the plain URL.
- If the skill supports more than one recipient, also create `usac-mn` for Marc Norman (CEO). Keep it unused until Jason asks for it.

## 3. Assets

Four diagram files are in `assets/`. Each is a complete HTML document so it can be previewed on its own. To embed one:

1. Copy its `<style>` block into the page, or into a page-scoped stylesheet.
2. Copy the single `<section>` element from its `<body>`.
3. Do not copy `<html>`, `<head>`, `<body>` or the Google Fonts `<link>` tags if the site already loads fonts.

Every diagram's CSS is scoped to its own wrapper class, so they won't collide with each other or with the site's styles.

| File | Wrapper class | Goes in section |
|---|---|---|
| `usac-member-journeys.html` | `.usac-j` | 2 |
| `usac-reduce-friction.html` | `.usac-f` | 4 |
| `usac-front-door-architecture.html` | `.usac-a` | 5 |
| `usac-our-experience.html` | `.usac-x` | 6 |

**Typography:** the diagrams specify Barlow and Barlow Semi Condensed. To match the Fast Forward page chrome, replace those font-family values in the four scoped stylesheets with the site's brand typeface (Manrope) and keep the stated fallbacks. Do not change the diagram colors. They are a deliberate system-by-system palette that the reader learns in section 2.

**Width:** each diagram sets its own `max-width` and padding. If the site's content column already pads its content, set the diagram's `padding-left` and `padding-right` to `0` inside the page.

**Remove the duplicate headings:** each diagram includes its own `h2` and lead paragraph. Keep them. Do not add a second site-level heading above any diagram; the section copy below gives the only extra text to add.

## 4. Page content

Use the copy below exactly. Headings are in sentence case. Do not add eyebrow labels, extra subheadings or decorative icons.

### Section 1: Opening

**H1:** USA Climbing member journey review

**Byline (small, muted):** Prepared for USA Climbing by Fast Forward, November 2026

**Lead paragraph:**
We walked through usaclimbing.org as a competitor, a parent, a judge and a routesetter would. This page shows what each of them goes through today, and how the site can become a single front door to the platforms USA Climbing already runs, without replacing any of them.

### Section 2: Four journeys today

Embed `usac-member-journeys.html` with no extra copy. Its own heading and lead carry the section.

### Section 3: What we found

**H2:** What we found

**Body (three short paragraphs, no bullets):**

About 20 platforms and vendors sit behind the member experience. Sport80 is the system of record for membership, compliance and payments; Vertical-Life handles competition entries and results; the Education Hub runs on Moodle Workplace; and the website ties them together with links.

Much of what members need to know lives outside the site. Season guides, schedules, qualified-athlete lists and officials lists are published Google Docs and Sheets, and many requests run through Google Forms. That content is hard to find, can't be searched from the site, and sits outside USA Climbing's design.

The biggest friction is at the seams. Competitors and parents join in Sport80, then re-enter the same details in Vertical-Life to register. When the details don't match exactly, the error doesn't say which field is wrong.

### Section 4: One front door

Embed `usac-reduce-friction.html` with no extra copy.

### Section 5: How it works

Embed `usac-front-door-architecture.html` with no extra copy.

### Section 6: Our experience

Embed `usac-our-experience.html`.

**Blocking check:** this diagram contains placeholder text marked with the class `fill` (yellow highlight, bracketed text). **Do not publish the page while any `.fill` element remains.** If any are still present at build time, stop and report which placeholders are unfilled. Jason is supplying the Northeastern and Boston Medical Center details separately.

Remove the diagram's footnote paragraph ("Highlighted text is a placeholder...") once the placeholders are filled.

### Section 7: A phased path

**H2:** A phased path

**Lead:** Each step stands on its own and sets up the next, so USA Climbing can commit one phase at a time.

**Three steps, shown as a numbered sequence (this content is a true sequence):**

1. **Discovery and fractional CTO.** We audit the platforms, interview staff, map journeys with real members, and deliver a costed roadmap the board can act on. A fractional CTO retainer gives USA Climbing senior technology leadership for vendor decisions and contracts. About 9–11 weeks.
2. **A new front door.** We rebuild usaclimbing.org on a headless front end with an integration layer for single sign-on, Sport80 and Vertical-Life data, Education Hub launches and Google Docs content. About six months, and it can be split across two budget years.
3. **Vendor consolidation.** When contracts come up for renewal, we run requirements, demos and selection, then plan and support the migration. Because the site talks to vendors through the integration layer, a vendor change doesn't mean another redesign. About 14–16 weeks.

**Do not show prices, hours or rates on this page.**

### Section 8: Next step

**H2:** Let's walk through it

**Body:** Thirty minutes is enough to go through the journeys, answer questions and talk about where a first phase would fit in USA Climbing's plans.

**Then:** insert the skill's standard contact block for **Jason Yarrington, Co-founder, Fast Forward**, with his email and LinkedIn link. Use the button label **Book 30 minutes** if the block has a scheduling button.

### Footer note

Add this small, muted line above the site footer:

This page is private and was prepared for USA Climbing. Findings are based on USA Climbing's public website and a member's view of its online systems.

## 5. Content that must not appear on the page

Do not add any of the following, even if it is available elsewhere in Fast Forward's files:

- Prices, estimates, hours or rates
- USA Climbing budget, revenue, fee or Form 990 figures
- Names of USA Climbing staff or board members
- Screenshots of the member portal or any member's personal details
- Lists of errors or broken links on usaclimbing.org
- Vendor contract or pricing speculation

## 6. QA checklist

- [ ] Page is at the exact URL in section 1 and returns 200
- [ ] `noindex, nofollow` is in the page `<head>`
- [ ] Page is absent from the sitemap, navigation and site search
- [ ] All four diagrams render, with no style collisions between them or with the site
- [ ] Diagrams use the site's brand typeface, and their colors are unchanged
- [ ] Layout works at 390px, 768px and 1280px widths, and in print preview
- [ ] No `.fill` placeholders remain
- [ ] The contact block shows Jason's correct email and LinkedIn link
- [ ] The tracking link works and is returned in the build output
- [ ] Nothing from section 5 appears on the page

## 7. Output to return

1. The live or preview URL
2. The recipient tracking URL or URLs
3. Any unfilled placeholders or QA items that failed
