---
description: Phase 7b — reactive visual-QA pass against the source site, with the seven known regression categories to look for
---

Visual QA pass. Side-by-side the new site against the source WordPress site in two browser windows. Walk every route and look specifically for the following categories of regression — these are the bugs that bit the original migration and any of them is likely to surface again:

1. **Desktop logo missing or hamburger on the wrong side.** In Tailwind 4, custom classes defined inside `@layer base/components/utilities` do NOT participate in responsive prefixes. `lg:my-custom-class` silently no-ops. If the desktop nav layout is broken, move the offending custom classes from `@layer` to `@utility` at-rules at the bottom of globals.css.
2. **Featured image clipping on the right edge of project detail pages.** If `<img className="w-full lg:mx-6">` the horizontal margin pushes the image beyond its container. Move the gutter to the wrapping element as `px-6`, not `mx-6`.
3. **White rubber-band peek above the fixed header when overscrolling on macOS.** Add `overscroll-behavior-y: none` on `html` in globals.css.
4. **CTA buttons rendering on a white instead of gradient background at the lg: breakpoint.** Same Tailwind 4 trap as #1 — move the gradient utility to an `@utility` at-rule.
5. **Gradient button hover transition snapping instead of fading.** Register the gradient color stops as `@property --gradient1..4` with `syntax: "<color>"` and transition the properties (not the `background-image`).
6. **Favicon defaulting to Next's.** Place `app/icon.png` and delete any stale `app/favicon.ico` — the App Router file convention takes precedence.
7. **`<header>` landmark missing.** SiteHeader's outer element should be `<header>` with the `<nav>` carrying `aria-label="Primary"`. Verify via axe DevTools or a quick view-source.

Apply each fix as you find the symptom. Don't fix what isn't broken. After the pass, run `npm run build` again and re-curl every sitemap route to confirm nothing regressed. Report which categories surfaced and the fix commit messages.
