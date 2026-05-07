# Design Session Brief

This file is loaded by the `/design-session` slash command. If you are reading
this because that command was invoked, you are in a **design-focused session**
for this Next.js marketing site. Adhere to the scope below for the rest of the
session. If a request would require a forbidden surface, stop and tell the
user to handle it in their coding session — do not work around the scope.

---

## Allowed surfaces (edit freely)

- [content/](content/) — all `.mdx`, `.yml`, `.yaml`
  - Copy, project case studies, service taxonomy, site settings/SEO strings
- [public/](public/) — images, SVGs, favicons, hero images, patterns, logos
- [app/globals.css](app/globals.css) — brand tokens in the `@theme` block (colors, type scale, container width), custom `@utility` rules, gradients, animations
- [app/fonts.ts](app/fonts.ts) — font families (currently Manrope + JetBrains Mono via `next/font/google`)
- [app/icon.png](app/icon.png), [app/manifest.ts](app/manifest.ts) — favicon/PWA metadata
- [components/](components/) — **`className` changes only**: visual adjustments via Tailwind classes. No prop/state/logic/import changes.

## Forbidden (defer to coding session)

- [lib/](lib/) — content loaders, helpers
- Any `.ts` / `.tsx` logic: props, state, hooks, event handlers, data-fetching
- Adding or removing `import` statements (the narrow exceptions: swapping a `next/font` import in `app/fonts.ts`, or a CSS-only import)
- Route handlers, `page.tsx` data-fetching, `layout.tsx` structural changes
- `next.config.*`, `package.json`, `tsconfig.json`, any deploy/CI config
- Adding or removing dependencies
- Business logic, data shape, API surface

## Brand reference pointers

Don't memorize values — read them from the source each time, they change:

- **Colors & type scale** → `@theme` block in [app/globals.css](app/globals.css) (tokens: `ff_black`, `ff_gray`, `ff_slateGray`, `ff_lightGray`, `ff_red`, `ff_teal`, `ff_tealDarker`; type scale `--text-xs` through `--text-3xl`)
- **Fonts** → [app/fonts.ts](app/fonts.ts)
- **Container width** → `--container-ff_siteWidth` (1600px) in `globals.css`
- **Reusable custom utilities** (defined in `globals.css`): `btn`, `hover-linear-gradient-underline`, `linear-gradient-background-hover`, `ff-entire-background`, `dark-background`, `radial-gradient-background`. Prefer these over recreating gradients inline.

**Tailwind v4 note:** there is **no** `tailwind.config.*` file. Styling is Tailwind v4 with CSS-native `@theme`. All token edits happen in [app/globals.css](app/globals.css).

## Content model pointers

- **Site settings / SEO** → [content/settings.yml](content/settings.yml); consumed by [app/layout.tsx](app/layout.tsx) via `getSettings()` for `<title>`, description, OG, Twitter card.
- **Service taxonomy** → [content/services.yml](content/services.yml)
- **Static pages** → [content/pages/](content/pages/) (e.g. privacy-policy.mdx, accessibility.mdx)
- **Project case studies** → [content/projects/](content/projects/) — MDX with frontmatter: `slug`, `date`, `sticky`, featured image reference
- **Loader** → [lib/content.ts](lib/content.ts) is **read-only reference** in this session; do not edit it to change content behavior, edit the YAML/MDX instead.

## Verification (after any design change)

Type-checking proves code correctness, not design correctness. Always verify visually:

1. Start dev server — check the script in [package.json](package.json) (typically `npm run dev`).
2. Visit affected pages in a browser:
   - **Copy changes** → load the rendered page, not just the MDX source
   - **Brand token changes** → spot-check homepage, a project detail page, and the contact form
   - **Image changes** → verify responsive variants and the OG/Twitter card (meta tags rendered by [app/layout.tsx](app/layout.tsx))
3. If you cannot verify visually, say so explicitly rather than claiming success.

## Do not modify

- [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md) — shared session primer
- [.claude/commands/design-session.md](.claude/commands/design-session.md) — this session's entry point
- This file — unless the user explicitly asks you to update the design scope
