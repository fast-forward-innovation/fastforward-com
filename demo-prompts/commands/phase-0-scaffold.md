---
description: Phase 0 — scaffold a fresh Next.js 16 + Tailwind 4 project with next/font and a Tailwind 4 @theme block
---

Scaffold a fresh Next.js 16 site at <TARGET_DIR>:

1. cd into <TARGET_DIR>'s parent and run:
   npx create-next-app@latest <basename of TARGET_DIR> --app --typescript --tailwind --src-dir=false --eslint --import-alias "@/*"
2. Add `"engines": { "node": ">=20" }` to package.json.
3. Swap the scaffold's fonts for `next/font/google`: Manrope (variable, `--font-manrope`) and JetBrains Mono (`--font-mono`). Wire both onto `<html className>` in app/layout.tsx.
4. In Tailwind 4 the theme lives as CSS custom properties inside `@theme { … }` in app/globals.css — there is no tailwind.config.ts. Port the source site's primary palette and any custom container width as `--color-*` and `--container-*` variables inside that block. If you don't know the palette yet, use neutral placeholders we'll refine after the export.
5. Confirm `npm run dev` serves a blank page with the chosen fonts and Tailwind classes working. Throttle the network in DevTools and reload — confirm no font swap reflow (next/font's size-adjust fallback metrics handle this).

Important gotcha to be aware of going forward: in Tailwind 4, any custom class used with a responsive prefix (`lg:`, `max-lg:`, etc.) MUST be declared via `@utility` at the bottom of globals.css, not inside `@layer components/utilities/base` — layer classes silently fail to participate in the responsive variant system.

Don't write a CLAUDE.md or commit yet. Just get the dev server up. Report when http://localhost:3000 renders with the right fonts and no reflow on reload.
