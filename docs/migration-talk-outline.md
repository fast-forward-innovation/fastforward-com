# Migrating fastforward.sh

**From Gatsby + Headless WordPress on Pantheon Decoupled, to Next.js on Pantheon's Next.js platform.**

Suggested length: 25–30 min + Q&A. Audience: technical (devs, agency
peers, Pantheon community). Adjust depth on §6/§7 if the room is more
business-leaning.

---

## 1. Cold open — why this talk (~1 min)

- One marketing site. Two repos. Two deploy pipelines. A CMS nobody
  loved. A static-site generator nobody wanted to upgrade past v4.
- We replaced all of it with one repo, no runtime CMS, and a
  Claude-Code-driven workflow.
- What I'll cover: the old shape, the new shape, the decisions, and
  the workflow that made it cheap to do.

---

## 2. The old architecture (~3 min)

> Goal: anchor the audience in what we were leaving behind.

- **Front end:** Gatsby 4 SSG (separate repo:
  `fast-forward-innovation/fastforward-web`).
- **CMS:** Headless WordPress on Pantheon (`dev-fast-forward-cms.pantheonsite.io`).
- **Glue:** WPGraphQL endpoint feeding Gatsby at build time.
- **Hosting:** Pantheon Decoupled Sites — front-end + CMS as paired
  environments.

**Pain points (be honest):**
- Two upgrade tracks (Node/Gatsby + PHP/WP plugins).
- ACF flex content as fragile, deeply nested JSON.
- GraphQL schema drift on every plugin update.
- Build + deploy was slow; copy edits required a CMS round-trip.
- Editors weren't really using the CMS UI anyway — devs were.

**Visual:** old architecture diagram. Two boxes (Gatsby repo,
WordPress repo) → arrow → Pantheon Decoupled platform → user.

---

## 3. The new architecture (~3 min)

> Goal: show how much smaller the surface got.

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript.
- **Styling:** Tailwind v4 — CSS-first, no `tailwind.config.*`.
  Tokens live in an `@theme` block in `app/globals.css`.
- **Fonts:** `next/font/google` (Manrope + JetBrains Mono) with
  `size-adjust` fallback metrics → no font-swap layout shift.
- **Content:** Plain MDX + YAML in `content/` at the repo root.
  Build-time loader (`gray-matter` + `js-yaml`) returns typed objects.
- **Hosting:** Pantheon's Next.js platform — GitHub-sourced,
  containerized Node, CDN-fronted.
- **Dynamic surface:** exactly two routes — `app/api/contact/route.ts`
  (POST → Monday.com Leads board) and `app/contact-submitted/page.tsx`.
  Everything else is statically generated and served from CDN.

**Visual:** new architecture diagram. One box (the repo) → Pantheon
Next.js → user.

**Quote-worthy line:** "We replaced two repos and three services
with one repo and zero runtime dependencies."

---

## 4. Static vs. dynamic vs. CMS-driven — how we chose (~4 min)

> Goal: this is the architecture decision the audience came for. Show
> your work.

**Three options on the table:**

1. **Keep WordPress-as-CMS, swap the front-end to Next.js.**
   Lowest migration cost; biggest infra debt left in place.
2. **Replace WP with a headless CMS** (Sanity, Contentful, Payload).
   Modernized editorial UI; still a runtime dependency, still an
   integration to maintain.
3. **Inline content as MDX/YAML in the repo.** No CMS at all. Editors
   become committers.

**Why we chose option 3:**

- Site is small: ~10 static pages, ~30 case studies.
- Editorial cadence is low (a few changes per quarter).
- The team editing copy is already comfortable in git.
- Content in git buys versioning, code review, atomic deploys, and
  rollbacks — for free.
- Removes an entire class of infra: no CMS DB, no plugin updates, no
  schema layer, no preview environment to keep in sync.
- Build is now deterministic from the repo state alone.

**Tradeoff we accepted:**
- Non-technical editors lose a WYSIWYG UI.
- Mitigation: MDX with frontmatter is approachable; PR-based editing
  fits how the team actually works.

**The general principle:** match the content model to the editorial
workflow, not to convention. A CMS is a tool — if no one is using it
the way it's meant to be used, the tool is the wrong shape.

---

## 5. The migration itself (~3 min)

> Goal: show that this wasn't a heroic rewrite — it was a scripted port.

- Built `scripts/export-wp-to-markdown.mjs` — a re-runnable,
  idempotent exporter.
  - WPGraphQL → MDX + YAML.
  - Downloaded ~140 MB of media into `public/`.
  - Mapped ACF flex blocks (`MainSection`, `ImageBlock`,
    `ClientQuote`) to a YAML discriminated union.
  - Concurrency: 8 parallel media downloads.
  - Outputs a `_migration-report.md` with stats and warnings.
- Because the script was idempotent, "what changed in WP since
  yesterday?" was just `re-run + git diff`.
- The port itself was 7 phases, one Claude session per phase:
  0+1: scaffold + content export · 2: content loader + layout ·
  3: pages + project detail · 4: dynamic pages + 404 ·
  5: contact form · 6: SEO + sitemap + GA · 7: pre-flight

**Visual:** screenshot of the phased commit log.

---

## 6. Where Claude Code earned its keep (~4 min)

> Goal: this is the workflow story. Be concrete.

- **Durable context** lives in two repo-checked files:
  - `CLAUDE.md` / `AGENTS.md` — short, opinionated. The
    "This is **NOT** the Next.js you know" warning that forces Claude
    to read `node_modules/next/dist/docs/` before writing anything.
- **Scope guards via slash commands.**
  - `/design-session` (in `.claude/commands/`) loads `DESIGN.md`,
    which enumerates *Allowed surfaces* (content, CSS, className-only
    on components) and *Forbidden* (lib/, logic, imports, configs).
  - Result: design sessions can't accidentally rewrite a route
    handler. Code sessions can't accidentally rewrite copy.
- **Phased rewrites as Claude sessions.** Each migration phase was a
  scoped conversation with a deliverable.
- **Boring work, automated.** Tailwind v3 → v4 token translation, ACF
  block-to-React component porting, page-by-page Gatsby → App Router
  conversion.
- **Brand kit as artifact.** Tribal design knowledge → `brand/` —
  portable to other Fast Forward projects, with a `/brand-apply`
  slash command for downstream agents.

**Lesson:** the unlock isn't "Claude writes code." It's *durable
context + scope guards + phased work*. The repo teaches the agent how
to behave; the slash commands keep it in its lane.

---

## 7. Terminus + Claude = production access from the prompt (~3 min)

> Goal: small section, big "aha." This is the moment the audience
> realizes the agent isn't just an editor — it's an operator.

- **Terminus** is Pantheon's CLI: clone envs, run drush, manage
  multidevs, clear CDN, deploy code, pull DB.
- Traditionally that means a second terminal, context-switching out
  of the editor, copy-pasting commands.
- With Claude Code given permission to run `terminus`:
  - "Pull a fresh DB from Live to Dev" → one prompt, Claude runs
    `terminus env:clone-content` and reports.
  - "Clear the CDN on Test after this deploy" → Claude runs
    `terminus env:clear-cache fastforward-com.test` (the same
    incantation we used to fix a ChunkLoadError after a deploy).
  - "Spin up a multidev for the redesign branch" → `terminus
    multidev:create` from inside the conversation.
- The agent reads the command output and adapts. It's a *feedback
  loop*, not a shortcut — Claude can react when an env is locked,
  retry, or escalate.
- **Demo (if live):** ask Claude `terminus env:list`, then "clone
  content from live to my dev environment." Audience sees the round
  trip happen.

**Lesson:** the value isn't `terminus` + Claude in isolation —
it's that the conversational interface collapses ops + dev into one
surface. The prompt is the new terminal.

> *Speaker note: tailor the specific terminus commands to the ones
> you actually used during the migration — drush, db pulls, multidev
> creation, etc. The cache-clear is the only one that landed in the
> repo; the rest lived in our sessions.*

---

## 8. Tag-based deploys: how code reaches production (~3 min)

> Goal: explain how the same Pantheon mental model — Dev → Test →
> Live, driven by GitHub — moves a static Next.js site through QA and
> into production. The same tag scheme that ships a copy edit shipped
> the entire platform migration.

**The three-environment spine — the same one we used in WordPress.**

- Pantheon's Next.js platform inherits the **Dev → Test → Live** model
  from their WordPress and Drupal products. Same mental model, different
  runtime underneath.
- Each environment has its own URL, its own Secrets Manager bucket,
  its own CDN cache.
- All three are driven by GitHub. No FTP, no `pantheon push`, no
  artifact upload — it's branches and tags.

**Dev: continuous from `main`.**

- Every push to `main` auto-builds and auto-deploys to Dev.
- URL: `dev-fastforward.pantheonsite.io`.
- Turnaround: 1–3 minutes; Pantheon dashboard shows the build in
  flight.
- This is where merged work gets QA'd before promotion.

**Test: tag with `pantheon_test_*`.**

```bash
git tag -a pantheon_test_$(date +%Y%m%d) -m "Promote to Test"
git push origin pantheon_test_$(date +%Y%m%d)
```

- Pantheon watches the repo for tags matching the prefix and builds
  the tagged commit into the Test environment.
- Test gets a separate URL and a separate Secrets bucket — production-
  like, not production. Run the QA pass here.

**Live: same pattern, `pantheon_live_*`.**

```bash
git tag -a pantheon_live_$(date +%Y%m%d) -m "Promote to Live"
git push origin pantheon_live_$(date +%Y%m%d)
```

- Same shape, different prefix. Live builds at
  `live-fastforward.pantheonsite.io` until DNS cuts over to
  `fastforward.sh` (apex; `www` 301-redirects).
- Rolling back is just tagging a prior commit with a fresh
  `pantheon_live_*` tag. There is no separate "undo" path — the git
  log *is* the deploy log.

**Multidevs: short-lived environments for risky changes.**

- For work that warrants a stakeholder review URL or that can't safely
  share `main` — a redesign branch, a migration phase mid-flight, a
  customer demo build — we cut a **multidev**: a fully isolated
  environment with its own URL, its own secrets, and its own CDN.
- The value isn't the tooling. It's that stakeholders can click a real
  URL that mirrors production behavior, without blocking the trunk and
  without colliding with another stakeholder's review.
- *(Speaker note: confirm your team's actual multidev convention
  before the talk — Pantheon Next.js multidev environments are
  typically driven by either a branch push (`mdev-<name>`) or a
  multidev-specific tag prefix. State the exact incantation your team
  uses, with one concrete example.)*

**Why this mattered for the migration.**

- The same tag scheme that ships a typo fix shipped the entire
  Gatsby + WordPress → Next.js platform migration.
- Each of the seven phased rewrites was a normal merge to `main`,
  promoted through Test, then Live, like any other release. There was
  no "migration mode" in the deploy pipeline — just smaller, more
  frequent tags.
- That meant we could have rolled back any phase to the prior tag if
  it had gone sideways. (We didn't, but the safety net was real.)

**Lesson**

- Tag-based deploys make releases auditable: the git log *is* the
  deploy log. Every Test build has a tag; every Live build has a tag;
  the diff between two tags is the diff that shipped.
- One mental model — *"push to `main`, tag to promote"* — covers
  everything from a one-line copy edit to a full architectural change.

---

## 9. Visual testing — match the test to the failure mode (~3 min)

> Goal: address the obvious "where are your tests?" question
> deliberately, not defensively.

- A static marketing site fails *visually*, not logically.
  Type-checking and lint don't catch a too-tight headline, a broken
  gradient, or a logo on the wrong background.
- We did **not** install Playwright / Percy / Chromatic. Reasoning:
  - Site changes are small and visible.
  - Snapshot tests on a brand site become noise — every layout
    refinement diffs.
  - Investment > value at our scale.
- What we did instead:
  - **Live verification.** Dev server running, browser open, walk
    the affected pages by hand.
  - **Claude as a visual reviewer.** Screenshots pasted into the
    conversation; Claude flags inconsistencies against `BRAND.md`
    /  `brand/GUIDELINES.md`.
  - **A codified spot-check.** `DESIGN.md` defines the 5-point
    smoke test for any visual change: headline on light bg,
    headline on gradient bg, a button, a link hover, a form input
    focus.
  - **Pantheon Test env as the safety net.** Promote to test, walk
    the site, *then* promote to live.
- **Don't:** confuse "no automated visual tests" with "no testing."
  Manual walkthroughs against an explicit checklist beat brittle
  snapshot diffs for sites this size.

**Lesson:** if your failures are visual, your testing has to be
visual. Match the test surface to the failure mode.

> *Speaker note: if you DID use a specific approach beyond the
> 5-point checklist (Claude reviewing screenshots in a session,
> diffing rendered pages, etc.), drop a 30-second concrete example
> here. Stories beat principles.*

---

## 10. What we'd do again — and what we'd do differently (~2 min)

**Do again**
- An idempotent exporter as the migration tool.
- Phased commits, one scope per phase.
- Repo-checked durable context (`CLAUDE.md`, `DESIGN.md`).
- Slash commands as scope guards.
- Brand-kit-as-artifact for downstream projects.

**Do differently** *(fill in based on actual experience — leave
this honest, not aspirational)*
- *(e.g.)* Build the brand kit on day one, not after launch.
- *(e.g.)* Tighter ACF-block → React-component contract earlier.
- *(e.g.)* …

---

## 11. Closer + Q&A (~1 min + Q&A)

- One repo. Zero runtime CMS. A workflow where the prompt is the
  terminal.
- Repo: `github.com/<org>/fastforward-web-next`
- Slides + brand kit will be linked in the recap.
- Open the floor.

---

## Appendix A — Slide-count target

If you're slide-budgeted: ~16 slides total.
- 1 title · 1 cold-open · 2 old arch · 2 new arch · 2 decision ·
- 1 migration · 2 Claude · 1 Terminus · 2 tag deploys ·
- 1 visual testing · 1 lessons · 1 closer.

## Appendix B — Numbers worth dropping in

- ~10 static pages, ~30 case studies.
- ~140 MB of migrated media.
- 8 phased commits, one Claude session each.
- 2 dynamic routes (contact form + redirect handler).
- 0 runtime CMS dependencies.

## Appendix C — Things to verify before the talk

- [ ] Pull current `terminus` commands you actually use into §7 (the
      repo only shows `env:clear-cache`; the others lived in
      sessions).
- [ ] Confirm the team's actual multidev creation convention for §8
      (branch-based push vs. multidev-specific tag pattern) and put
      one concrete example on the slide.
- [ ] Confirm Next.js / React / Tailwind versions against
      `package.json` at presentation time (versions move).
- [ ] Have the demo env warmed up if you're showing a live Claude +
      Terminus moment.
- [ ] Decide whether to show real screenshots of the old WP admin /
      Gatsby build for the "before" slide.
