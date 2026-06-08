---
description: Phase 4 — dynamic [slug] page route + contact stubs + 404
---

Add the remaining routes:

1. `app/[slug]/page.tsx` — dynamic catch-all for WP pages. `dynamicParams = false`, `generateStaticParams()` returns every `getAllPages()` slug. Dispatch by frontmatter `layout`: `"landing"` → `<LandingPage />`, anything else → `<Page />`.
2. `components/Page.tsx` — simple wrapper: title + featuredImage + contentHtml (via `dangerouslySetInnerHTML`).
3. `components/LandingPage.tsx` — hero + feature grid (read from frontmatter `features` array, default empty) + WP content + `FeaturedProjects` bottom.
4. `app/contact-us/page.tsx` — static heading + address block + a `<ContactForm />` placeholder (real form lands in Phase 5).
5. `app/contact-submitted/page.tsx` — reads `searchParams.success` and shows a success / failure message. Mark robots `noindex`.
6. `app/not-found.tsx` — clean 404.

`npm run build` should now produce more routes — at least one per WP page, plus `/contact-us`, `/contact-submitted`, and the 404. Report the new route count and confirm `/this-slug-does-not-exist` 404s when `npm run start` is running.
