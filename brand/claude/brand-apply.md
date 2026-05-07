---
description: Audit the current code against Fast Forward brand guidelines and propose a diff
---

You have access to the Fast Forward brand kit at `brand/` in this
project.

## Steps

1. Read `brand/GUIDELINES.md` in full. Then open `brand/css/tokens.css`
   and `brand/fonts.ts` so you have the actual token values (don't
   rely on memory — the doc can drift).

2. **Identify scope.** If the user named a specific file, page, or
   component, focus there. Otherwise ask which surface to target
   before doing any work.

3. **Audit** the target for off-spec values:
   - Raw hex in component files → replace with `ff_*` color tokens
   - Pure `#000` or `#fff` for body copy → use `ff_black` / `ff_lightGray`
   - Off-scale font sizes → map to nearest scale token
   - Inline gradient declarations → replace with
     `.linear-gradient-background`, `.radial-gradient-background`, or
     `linear-gradient-background-hover` as appropriate
   - Bespoke button padding/radius → replace with the `btn` utility
   - Self-hosted fonts or `<link>` to Google Fonts → move to
     `next/font/google` via `brand/fonts.ts`
   - PNG/JPG logos → swap for the SVGs in `brand/logos/`
   - Wrong logo variant for the background (light mark on dark bg,
     dark mark on gradient) → swap

4. **Propose the diff before writing.** Group changes by file. Show
   the user what you intend to change and get confirmation.

5. After applying, report: what changed, what was left alone, and
   why.

## Constraint

If a brand-aligned replacement would require introducing a new token,
a new gradient, or a new font, **stop**. The kit needs an amendment
first — tell the user so they can decide whether to extend the kit or
accept the deviation.
