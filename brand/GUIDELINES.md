# Fast Forward — Brand Guidelines & Coding Standards

Source of truth for visual identity (colors, typography, logos) and the
code conventions that realize them. Everything a new Fast Forward
project needs to stay on-brand.

> Canonical values live inside this kit:
> - Design tokens → `css/tokens.css`
> - Base element styles → `css/base.css`
> - Layout components → `css/components.css`
> - Brand utilities → `css/utilities.css`
> - Fonts → `fonts.ts`
> - Logos → `logos/`
> - Patterns → `patterns/`
> - Icons → `icons/`
>
> If this doc ever disagrees with those files, the code wins — update
> this doc rather than the code.

---

## For Claude Code and other AI agents

If this file is loaded into your context (via `@brand/GUIDELINES.md`
in a project `CLAUDE.md`, via a slash command, or via explicit user
reference), treat the rules below as authoritative constraints on
design changes.

When the user asks you to "apply the brand," "update styling to match
the guidelines," or similar:

1. Read the actual tokens you'll need: `brand/css/tokens.css` and
   `brand/fonts.ts`. Don't rely on memory of values in this doc — they
   drift.
2. Audit the target file for off-spec values: raw hex, off-scale font
   sizes, bespoke gradients, self-hosted fonts, PNG logos, wrong logo
   variant for the background.
3. Replace with token references and kit utilities.
4. Report what you changed and what you left alone (and why).

Never invent new tokens, new gradient stops, or new fonts. If the
requested change would require one, stop and ask the user to amend the
kit first.

---

## Table of contents

1. [Logo](#1-logo)
2. [Color](#2-color)
3. [Gradients](#3-gradients)
4. [Typography](#4-typography)
5. [Layout & spacing](#5-layout--spacing)
6. [Iconography & patterns](#6-iconography--patterns)
7. [Reusable utilities](#7-reusable-utilities)
8. [Coding standards](#8-coding-standards)
9. [Install checklist](#9-install-checklist)

---

## 1. Logo

Files live in `logos/`. Ship them as SVG — never rasterize.

| File | Use |
| --- | --- |
| `logos/ff-logo.svg` | Primary mark. Header, light backgrounds, marketing collateral. |
| `logos/ff-footer-logo.svg` | Footer variant. Use on dark or gradient backgrounds. |
| `logos/app-icon.png` | Favicon / PWA icon source (512×512). |

### Clear space & sizing
- Minimum clear space around the mark: **½ the cap-height of "FF"** on every side.
- Minimum rendered width: **96px**. Below that, switch to the favicon glyph.
- Do not recolor, rotate, outline, add drop shadows, or set the mark on a
  busy photo without a solid/gradient wash behind it.

### When to use which
- Light page chrome → primary `ff-logo.svg`.
- Dark hero, gradient band, or the radial-gradient background →
  `ff-footer-logo.svg`.
- Social avatar or app tile → `app-icon.png` (center-cropped, no padding).

---

## 2. Color

All palette tokens live in `css/tokens.css`. Token names use the `ff_`
prefix so they never collide with Tailwind defaults.

| Token | Hex | Role |
| --- | --- | --- |
| `--color-ff_black` | `#191819` | Default text, dark backgrounds. Not pure black — slightly warm. |
| `--color-ff_gray` | `#7f7d81` | Secondary text, metadata, captions. |
| `--color-ff_slateGray` | `#aaaaaa` | Dividers, disabled state, subtle borders. |
| `--color-ff_lightGray` | `#edf1f2` | Section backgrounds, cards on white. |
| `--color-ff_red` | `#dd2e2a` | Primary accent. CTAs, error state, brand flourish. Use sparingly. |
| `--color-ff_teal` | `#008ca8` | Link color, inline accents (footer bullets, `→` glyphs). |
| `--color-ff_tealDarker` | `#004a59` | Hover / pressed state for teal links on light backgrounds. |

Tailwind v4 auto-generates utilities from these tokens:
`text-ff_black`, `bg-ff_lightGray`, `border-ff_red`, etc.

### Usage rules
- **Text:** default to `ff_black`; drop to `ff_gray` only for secondary
  info. Never use pure `#000` or `#fff` for body copy against colored
  panels — use the tokens.
- **Links:** `ff_teal`, underline on hover via the
  `hover-linear-gradient-underline` utility (§7).
- **Accent red:** one dominant use per viewport at most. It's a
  point-of-emphasis color, not decoration.
- **Off-palette colors** (e.g. `#18397f`, `#1e2142`) are **gradient stops only** —
  do not use them as standalone surface colors.

---

## 3. Gradients

The brand's signature visual. Two canonical gradients, both defined in
`css/utilities.css`.

### Linear brand gradient
Red → deep red → brand blue → near-black navy, at `148.48deg`.

Reach for it via `.linear-gradient-background`. For buttons and
interactive surfaces that should flip on hover, use the
`linear-gradient-background-hover` `@utility` — it uses `@property`
declarations so the stops tween smoothly instead of snapping.

### Radial brand gradient
Same stops, origin at top-left, radius scales with viewport. Use for
full-bleed hero sections via `.radial-gradient-background`. It handles
the mobile/desktop radius swap (200vw → 75vw at `md`). Use
`.radial-gradient-background-small` for a shorter secondary band.

### Rules
- Never introduce a new gradient direction or new stops. If you need
  a different palette moment, use a solid token color.
- Text over either gradient is always `ff_lightGray` or pure white.
- Do **not** layer text directly over the red→red transition zone
  (0–20%) — contrast fails. Keep text in the blue → navy half.

---

## 4. Typography

### Families
Set in `fonts.ts`, loaded via `next/font/google` (with `display: swap`
and size-adjusted fallback metrics — **never** self-host).

| Family | Role | Variable |
| --- | --- | --- |
| **Manrope** | Sans — all UI, headings, body copy. | `--font-manrope` |
| **JetBrains Mono** | Mono — code, metadata chips, deliberate accents. | `--font-jetbrains-mono` |

### Weights in use
- Manrope 400 (body), 600 (buttons), 700 (headings).
- JetBrains Mono 400.

Request only the weights you actually render — `next/font` will subset.

### Type scale
Defined in `css/tokens.css`. Each step has a paired line-height
(`--text-*--line-height: 1.6`) so rhythm stays consistent.

| Token | Size | Typical use |
| --- | --- | --- |
| `--text-xs` | `0.75rem` (12px) | Legal, meta tags |
| `--text-sm` | `0.875rem` (14px) | Captions, form labels |
| `--text-md` | `1rem` (16px) | Form labels (desktop), fine print |
| `--text-lg` | `1.125rem` (18px) | Small body, navigation |
| `--text-base` | `1.31rem` (~21px) | **Default body copy** — note: larger than the web default |
| `--text-3xl` | `1.875rem` (30px) | Subheads, eyebrows |

Heading sizes are set in `css/base.css` using fluid Tailwind classes
(e.g. `h1` is `text-[2.5rem] md:text-[3.75rem] lg:text-[5.6rem]`).
Do not override per-page. If a page needs a different scale, revisit
the token, not the selector.

### Rules
- Body copy is `--text-base` (≈21px), not 16px. This is intentional — it
  gives the marketing voice room to breathe. Don't drop it.
- All headings use Manrope. There is no serif in the system.
- Letter-spacing: default. Don't tighten or loosen headings.
- Mono is an accent — never for paragraphs.

---

## 5. Layout & spacing

### Container
- Site width: `--container-ff_siteWidth: 1600px`. Use `max-w-screen-xl`
  (1280px) for reading-width sections, `max-w-ff_siteWidth` for
  edge-to-edge marketing bands.
- Section padding: `py-16 px-6 md:px-12 md:py-24` — codified in the
  `.section` and `.section-wide` component classes. Prefer those over
  re-declaring.

### Rhythm
- Vertical spacing between sections is handled by `.section` padding,
  not by margins on children.
- Headings get built-in bottom padding (`pb-3 md:pb-5 lg:pb-8`) via
  `css/base.css` — do not add `mb-*` on top of that.

### Breakpoints
Tailwind v4 defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.
No custom breakpoints.

---

## 6. Iconography & patterns

### Icons
Inline SVG, single-color, aligned to a 24px grid.

- Service icons: see `icons/service/`.
- Social icons: `icons/social/` — both colored and monochrome-black
  variants per platform so each can sit on any background.
- `icons/red-arrow.svg` — directional accent. Use for "continue
  reading" / "next project" affordances, never as pure decoration.

### Background patterns
- `patterns/pattern.svg` — horizontal tile, right-aligned. Use via
  `.ff-background`.
- `patterns/fst-fwd-background.svg` — full-bleed wordmark watermark
  layered over a light gradient. Use via `.ff-entire-background`.

> **Note:** the `.ff-background` and `.ff-entire-background` utilities
> reference patterns at `/brand/patterns/…`. If you place the kit
> somewhere else under `public/`, update the URL strings in
> `css/utilities.css` to match.

Don't invent new patterns; these two are load-bearing brand signals.

---

## 7. Reusable utilities

Defined in `css/utilities.css`. Prefer these over re-declaring the
underlying CSS.

| Class | What it does |
| --- | --- |
| `btn` | Canonical button shape (`text-xl xl:text-base py-3 px-6 rounded font-semibold`). Pair with a color utility. |
| `hover-linear-gradient-underline` | Animated gradient underline on hover. Default link treatment on marketing pages. |
| `linear-gradient-background` | Static brand gradient fill + white text. |
| `linear-gradient-background-hover` | Same fill; stops tween on hover via `@property`. Use for gradient buttons. |
| `radial-gradient-background` | Full-bleed hero band. |
| `radial-gradient-background-small` | Shorter secondary band. |
| `ff-entire-background` | Wordmark watermark + light gradient. |
| `ff-background` | Right-edge pattern. |
| `dark-background` | `bg-ff_black` + forces all descendant text to white. |
| `section` / `section-wide` | Standard vertical rhythm + horizontal padding. |

---

## 8. Coding standards

### Tailwind v4, CSS-first
Use Tailwind v4 with the `@theme` directive. **Do not introduce a
`tailwind.config.js` / `.ts`.** All tokens, custom utilities, and
component classes live in CSS.

```css
/* app/globals.css */
@import "tailwindcss";
@import "../brand/css/tokens.css";
@import "../brand/css/base.css";
@import "../brand/css/components.css";
@import "../brand/css/utilities.css";
```

### Naming
- **Color tokens:** `--color-ff_<name>` — `ff_` prefix, camelCase after.
  This prefix is mandatory so tokens never shadow Tailwind's defaults
  (`--color-red-500` etc. still resolve).
- **Size tokens:** match Tailwind's built-in names (`--text-base`,
  `--container-ff_siteWidth`) so utilities auto-generate.
- **Custom utilities:** kebab-case, descriptive of the *effect* not the
  component (`linear-gradient-background-hover`, not `red-button`).

### Where to put rules
- **Design tokens** → `@theme { }` (in `tokens.css`).
- **Base element defaults** (headings, `button`, form fields) →
  `@layer base` (in `base.css`).
- **Layout building blocks** (`.section`, list decorators) →
  `@layer components` (in `components.css`).
- **Effects** (gradients, hover treatments) → `@layer utilities` or
  top-level `@utility` blocks (in `utilities.css`).
- **Responsive variants required?** → must be declared via top-level
  `@utility`. Tailwind v4 only generates `sm:`/`md:`/`lg:` variants for
  classes declared that way. Classes inside `@layer utilities` will not
  get responsive prefixes.

### Fonts
- Load every font with `next/font/google` (or `next/font/local`). No
  `<link>` tags to Google Fonts, no self-hosting that bypasses
  `size-adjust` fallback metrics.
- Declare each family as a CSS variable (`variable: "--font-manrope"`)
  and wire it into `@theme` via `--font-sans` / `--font-mono`. Never
  call the font directly from a component — always go through the token.
- Apply both variables on `<html>` in your root layout (see
  `examples/layout.tsx.example`).

### Component styling
- **Styling is `className`-only.** Components receive data via props;
  visual decisions live in Tailwind classes + the brand stylesheets.
  Don't inline `style={{}}` unless you're binding a dynamic value that
  can't be a class (rare — usually a gradient stop or a computed width).
- Prefer a custom utility over repeating a 6-stop gradient inline.
- Don't reach for CSS-in-JS libraries (styled-components, emotion, etc.) —
  they fight the `@theme` pipeline.

### Asset handling
- SVG logos and icons are referenced by URL path (`/brand/logos/ff-logo.svg`) —
  **not** imported as React components. Keeps the bundle slim.
- Photos use `next/image` with explicit `width`/`height` and a `sizes`
  attribute.

### Accessibility floor
- Text contrast on every gradient surface must pass WCAG AA (4.5:1 for
  body, 3:1 for large text). When in doubt, test against the darkest
  and lightest stops separately.
- Interactive elements get a visible focus style — don't remove the
  browser default without replacing it (kit form inputs do this via
  `outline-color: #18397f`).
- Icon-only buttons need an `aria-label`.

---

## 9. Install checklist

To bootstrap a Fast Forward project on-brand:

- [ ] Copy this `brand/` directory into your project root.
- [ ] Install Tailwind v4 (`tailwindcss@^4`) — no `tailwind.config.*` file.
- [ ] In `app/globals.css`, `@import` the four kit stylesheets in order
      (tokens → base → components → utilities). See
      `examples/globals.css.example`.
- [ ] In `app/fonts.ts`, re-export from `brand/fonts.ts`:
      `export { manrope, jetbrainsMono } from "../brand/fonts";`
      and apply both variables on `<html>` in `app/layout.tsx`
      (see `examples/layout.tsx.example`).
- [ ] Mirror asset paths under `public/brand/` (or update the URLs in
      `css/utilities.css` to wherever you serve them from).
- [ ] Generate a favicon from `logos/app-icon.png` → `app/icon.png`.
      Update `app/manifest.ts` with the product name, theme color
      (`#191819`), and background color (`#edf1f2`).
- [ ] Spot-check: headline on light bg, headline on gradient bg, a
      button, a link hover, a form input focus. If all five look right,
      the system is wired correctly.

---

## Don't

- Don't add new colors, gradients, or fonts without amending the kit
  (both this doc **and** `css/tokens.css`). A one-off hex in a
  component is how a brand drifts.
- Don't reintroduce a JS Tailwind config.
- Don't self-host Google Fonts — use `next/font`.
- Don't ship PNG/JPG logos.
- Don't override heading sizes per page.
- Don't put brand colors as raw hex in component files. Always go
  through a token.
