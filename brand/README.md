# Fast Forward Brand Kit

Drop this directory into any Fast Forward project to inherit the
brand's visual identity — color tokens, typography, logos, gradients,
and the coding conventions that hold them together.

Fully self-contained. Designed for both human reference and Claude
Code auto-discovery.

---

## What's inside

```
brand/
├── GUIDELINES.md          ← full brand spec (read this)
├── README.md              ← this file (install + usage)
├── fonts.ts               ← next/font declarations
├── css/
│   ├── tokens.css         ← @theme: colors, type scale, container width
│   ├── base.css           ← @layer base: headings, buttons, form fields
│   ├── components.css     ← @layer components: .section, .section-wide
│   └── utilities.css      ← gradients, .btn, hover treatments
├── logos/                 ← primary mark, footer mark, app icon
├── patterns/              ← background patterns
├── icons/                 ← service icons, social icons, red arrow
├── examples/              ← reference globals.css, layout.tsx, button
└── claude/
    └── brand-apply.md     ← drop-in /brand-apply slash command
```

---

## Install into a Next.js project

1. **Copy** the entire `brand/` directory into your project root.

2. **Wire up the CSS.** In your `app/globals.css`:

   ```css
   @import "tailwindcss";

   @import "../brand/css/tokens.css";
   @import "../brand/css/base.css";
   @import "../brand/css/components.css";
   @import "../brand/css/utilities.css";

   /* your project-specific styles below */
   ```

3. **Wire up the fonts.** In `app/fonts.ts`:

   ```ts
   export { manrope, jetbrainsMono } from "../brand/fonts";
   ```

   Then in `app/layout.tsx`, apply both variables on `<html>`
   (see `examples/layout.tsx.example`).

4. **Mirror brand assets into `public/`** so they're served at
   `/brand/logos/ff-logo.svg`, `/brand/patterns/pattern.svg`, etc.
   Easiest options:
   - Copy `brand/logos`, `brand/patterns`, `brand/icons` into
     `public/brand/`.
   - Or symlink: `ln -s ../brand/logos public/brand/logos` (etc.).
   - Or update the URL strings in `css/utilities.css` to wherever you
     serve them from.

5. **Verify.** Load a page and spot-check:
   - Headline on light background (Manrope, fluid sizing)
   - Headline on gradient background (`.radial-gradient-background`)
   - A `btn` button
   - A link hover (gradient underline animates in)
   - A form input focus (blue outline)

   If all five look right, the system is wired correctly.

See [GUIDELINES.md](./GUIDELINES.md) for the full spec, do/don't
rules, and checklist.

---

## Use with Claude Code

**Goal:** drop this kit into any project and say "update the design
of this app to be consistent with the brand guidelines" — and Claude
Code picks up the reference automatically.

### Method A — Ambient (recommended)

Add one line to your project's `CLAUDE.md` (or `AGENTS.md`):

```md
@brand/GUIDELINES.md
```

Claude Code resolves `@path.md` imports at context-load time. Every
conversation in that project now has the full brand spec loaded. When
you say "apply the brand to this page," Claude already knows the
rules.

### Method B — Slash command

Copy the template slash command into your project:

```sh
mkdir -p .claude/commands
cp brand/claude/brand-apply.md .claude/commands/brand-apply.md
```

Now invoke `/brand-apply` in any session. It instructs Claude to read
`brand/GUIDELINES.md`, audit the current scope against it, and
propose the diff before editing.

### Method C — Both

Method A gives Claude ambient awareness (every turn). Method B gives
you a one-shot audit command. They compose — use both.

### Maintaining one canonical copy across projects

Instead of copying `brand/` into every project, add it as a git
submodule:

```sh
git submodule add <brand-repo-url> brand
```

Methods A and B work identically. When tokens change upstream, run
`git submodule update --remote` in each project.

---

## Updating the kit

The kit is the source of truth. If something needs to change:

1. Edit the canonical files under `brand/` in this repo.
2. Update [GUIDELINES.md](./GUIDELINES.md) to match.
3. In each consumer project, pull the new files (re-copy or
   `git submodule update --remote`).
4. Run the 5-point visual spot check from the install section.

Never diverge at the consumer: if a project needs a variant the kit
doesn't support, amend the kit first, then pull.
