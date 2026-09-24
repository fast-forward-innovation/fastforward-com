# Fast Forward marketing site — agent context

Next.js 16 (App Router) marketing site for Fast Forward, hosted on **Pantheon's
Next.js platform**. Nearly all content is MDX and YAML under `content/`, read at
build time by `lib/content.ts` and rendered through a block system. Most tasks
here are content and design work, not application code.

New machine? Start at [ONBOARDING.md](ONBOARDING.md), then run `npm run doctor`.

## Names that are easy to get wrong

| Thing | Value |
|---|---|
| Pantheon **site** | `fastforward` — this is what `terminus` wants |
| GitHub **repo** | `fast-forward-innovation/fastforward-com` |
| Pantheon environments | `dev`, `content`, `test`, `live`, plus ephemeral `pr-*` |
| Production URL | `https://fastforward.sh` (www 301s to apex) |

`terminus env:clear-cache fastforward-com.dev` **fails** — the site is
`fastforward`, not `fastforward-com`. The repo and the site have different names.

## Hard rules

1. **Never push to `main`.** Every change ships as a branch plus a PR
   (`scripts/deploy-feature-branch.sh <branch>` does branch → push → `gh pr create`).
   Pantheon builds a `pr-*` preview environment for every open PR.

2. **`multi-*` branches are standing multidev environments, not feature branches.**
   `multi-content` and `multi-marketing` map to long-lived Pantheon environments.
   Pushing to one rebuilds that environment directly, with **no PR** — builds take
   several minutes. Do not delete these branches and do not open PRs from them.

3. **Deploys are tag-driven.** Merging to `main` auto-deploys to **Dev**. Promote
   with tags: `pantheon_test_<date>` → **Test**, `pantheon_live_<date>` → **Live**
   (`/deploy-test` and `/deploy-live` wrap this). There are two git remotes,
   `origin` (ssh) and `pantheon` (https), pointing at the same GitHub repo —
   push to `origin`.

4. **`terminus` is used here**, despite what the caching notes imply. Pantheon's
   Next.js platform ignores `pantheon.yml`/Quicksilver, but the CLI itself works
   and is how we clear caches, clone content between environments, and manage
   multidevs. **Ask before running any terminus command that writes** —
   `env:clear-cache`, `env:clone-content`, `multidev:create`, anything `secret:*`.
   Read-only calls (`auth:whoami`, `site:info`, `env:list`) are fine.

5. **Read the local Next.js docs before writing Next.js code.** This version has
   breaking changes relative to training data — see the generated note below.

6. **Secrets are write-only on Pantheon.** You cannot read values back out of
   Secrets Manager; `terminus secret:site:list` returns names with null values.
   `npm run sync-env` reconciles the *key set* in `.env.local`, never the values.
   Never print a secret value into the transcript.

## Where to look

| Task | Read |
|---|---|
| Setting up a machine | [ONBOARDING.md](ONBOARDING.md), then `npm run doctor` |
| Authoring or editing content | [CONTENT.md](CONTENT.md) |
| Visual, brand, or image work | [DESIGN.md](DESIGN.md), `brand/GUIDELINES.md` |
| Shipping content through review | `.claude/commands/workflow.md` |
| Architecture, deploys, env vars | [README.md](README.md) |
| What each env var means | `.env.local.example` |

## Slash commands in this repo

`/workflow` · `/new-page` · `/new-project` · `/edit-page` · `/design-session` ·
`/deploy-test` · `/deploy-live` — defined in `.claude/commands/`.

Content moves through an editorial state machine tracked in each MDX file's
`editorial:` frontmatter — `draft → review → revisions → approved → live`.
`/workflow` owns those transitions; don't hand-edit the block without it.

## Before opening a PR

CI runs three required jobs on every PR to `main`. Run them locally first:

```bash
npm run lint && npm run typecheck && npm run test:unit && npm run test:e2e
```

`npm run build` is also worth running — it is exactly what Pantheon runs, and it
catches route-generation errors that `npm run dev` tolerates.

@AGENTS.md
