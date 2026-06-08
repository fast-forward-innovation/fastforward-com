---
description: Phase 7c — git init + push to GitHub + deploy to Vercel (no Pantheon, no DNS)
---

Deploy to Vercel as the demo host (substitute another host later if needed; the steps generalise).

1. Initialize a git repo if not already (`git init && git add . && git commit -m "Initial port"`).
2. Ask the operator to create a fresh GitHub repo on github.com (don't create it through the API on their behalf). Once they provide the URL, `git remote add origin <url>` and `git push -u origin main`.
3. Install the Vercel CLI if needed (`npm i -g vercel`), then `vercel link` and `vercel` from inside `<TARGET_DIR>`. Confirm the build runs on Vercel's side and the preview URL serves correctly.
4. Set environment variables on the Vercel project (**Production** scope):
   - `MONDAY_API_TOKEN` (if Phase 5 was Option A; otherwise skip).
   - `NEXT_PUBLIC_SITE_URL = <CANONICAL_URL>` (so sitemap.xml / robots.txt reference the real domain).
5. `vercel --prod` and confirm the production URL returns the same routes that local `npm run start` did.

Skip DNS for the demo — leave the site at the Vercel-assigned URL. The operator can cut DNS over to it later.

Report the production URL and the result of `curl <url>/sitemap.xml | head -20` so the audience can see the deployed site enumerating its routes.
