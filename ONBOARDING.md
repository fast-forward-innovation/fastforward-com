# Onboarding

Day-one setup for the Fast Forward marketing site. Work top to bottom; every
step ends in a command that tells you whether it worked. At the end,
`npm run doctor` should be green.

If you only want to know *why* things are set up this way, read
[README.md](README.md) instead — this file is the checklist.

> **Two names, and they differ.** The Pantheon **site** is `fastforward`. The
> GitHub **repo** is `fastforward-com`. Commands that take a site name want
> `fastforward`.

---

## 1. Clone and install

```bash
git clone git@github.com:fast-forward-innovation/fastforward-com.git
cd fastforward-com
nvm use          # reads .nvmrc (Node 20)
npm ci
```

**Verify:** `node -v` prints v20.x.

If you don't use `nvm`, any Node 20+ works — `fnm`, `asdf`, `volta`, or a system
install. The doctor script checks the version, not how you got it.

## 2. Run the site

```bash
npm run dev      # http://localhost:3000
```

**Verify:** the homepage loads.

Yes, already — **the site runs with no `.env.local` and no secrets at all.**
Content lives in `content/` as MDX and YAML, and everything that needs a token
degrades quietly instead of breaking. Get tokens later, when you need them
(step 6).

## 3. GitHub CLI

Every change ships as a PR, so you need `gh`.

```bash
brew install gh
gh auth login
```

**Verify:** `gh auth status` reports you as logged in.

## 4. Pantheon CLI (terminus)

Needed to deploy, clear caches, and manage environments.

```bash
brew install pantheon-systems/pantheon/terminus
```

Then create a machine token at **dashboard.pantheon.io → Account → Machine
Tokens → Create token**. It is shown **once** — copy it before leaving the page.

```bash
terminus auth:login --machine-token=<paste-token-here>
```

**Verify:**

```bash
terminus auth:whoami            # your Pantheon email
terminus site:info fastforward  # confirms you're on the site's team
```

If `auth:whoami` works but `site:info` errors, you have terminus but not access
to this site — **ask Jason to add you to the `fastforward` team on Pantheon.**
No amount of reinstalling fixes that one.

## 5. Pantheon Content Publisher MCP

The server config already ships in `.mcp.json`, so there is nothing to install —
but each person authorizes it once, with their own account.

1. Open Claude Code in this repo, interactively (not `-p`).
2. Run `/mcp` → select `pantheon-content-publisher` → **Authenticate**.
3. Approve in the browser window that opens.

**Verify:** `npm run doctor` shows the MCP line as `[ OK ]`.

*Optional, unrelated to local dev:* there is also an account-level Pantheon
connector for claude.ai, added under **claude.ai → Settings → Connectors**. It
can't be committed to the repo because it belongs to your account, not the
project. Skip it unless you want Pantheon tools inside claude.ai itself.

## 6. Environment variables — only when you need them

Start with nothing. Pick up a token the day you touch the feature that needs it.

```bash
npm run sync-env
```

This reconciles `.env.local` against the key list Pantheon expects, seeds the
file from `.env.local.example` so the explanatory comments come with it, and
fills in Cloudflare's public "always passes" Turnstile test pair.

It does **not** fetch values. Pantheon's Secrets Manager is write-only — secret
names come back, values don't — so nothing can hand them to you automatically.

| You're working on | You need | How to get it |
|---|---|---|
| Anything else | nothing | — |
| The contact form (`app/api/contact`) | `MONDAY_API_TOKEN` | Ask Jason. Without it the form 500s on submit; the rest of the site is fine. |
| Lab Project pages | `PCC_SITE_ID`, `PCC_TOKEN` | Ask Jason. Without them those pages render empty and the server logs a notice. |
| Inquiry auto-classification | `ANTHROPIC_API_KEY` | console.anthropic.com. Optional — submissions just go through untagged. |
| Content Publisher webhooks | `PCC_WEBHOOK_SECRET` | `openssl rand -hex 32`, then set the same value on Pantheon. |

`.env.local` is read at server start — restart `npm run dev` after editing it.

## 7. Check your work

```bash
npm run doctor
```

Green is the goal. Exit codes: `2` means local dev is broken, `3` means local
dev is fine but deploy tooling isn't ready. Warnings are acceptable — they call
out degraded features, not blockers.

## 8. Ship something

```bash
git switch -c yourname/first-change
# ...edit...
git commit -am "docs: fix a typo"
scripts/deploy-feature-branch.sh yourname/first-change
```

That pushes and opens a PR. Pantheon builds a preview environment for every open
PR; the URL appears in the PR's checks once the build finishes. Three CI jobs
must pass — lint + typecheck, unit tests, Playwright e2e. Run them locally first:

```bash
npm run lint && npm run typecheck && npm run test:unit && npm run test:e2e
```

Then merge. Merging to `main` deploys to Dev automatically.

---

## Rules that aren't obvious

These are the ones that bite people. [CLAUDE.md](CLAUDE.md) has the full set.

- **Never push to `main`.** Always a branch and a PR.
- **`multi-*` branches are not feature branches.** `multi-content` and
  `multi-marketing` are standing Pantheon multidev environments. Pushing to one
  rebuilds that environment directly, with **no PR**, and takes several minutes.
  Don't delete them; don't open PRs from them.
- **Deploys are tag-driven.** `main` → Dev. `pantheon_test_<date>` → Test.
  `pantheon_live_<date>` → Live. The `/deploy-test` and `/deploy-live` slash
  commands wrap this.
- **Ask before write-y terminus commands** — `env:clear-cache`,
  `env:clone-content`, `multidev:create`, anything `secret:*`.

## Where things are documented

| Topic | File |
|---|---|
| Architecture, deploys, troubleshooting | [README.md](README.md) |
| Writing content (MDX, blocks, voice) | [CONTENT.md](CONTENT.md) |
| Design and brand constraints | [DESIGN.md](DESIGN.md), `brand/GUIDELINES.md` |
| Rules for AI agents | [CLAUDE.md](CLAUDE.md) |
| What each env var does | `.env.local.example` |
| Editorial review workflow | `.claude/commands/workflow.md` |

## If something's wrong

| Symptom | Cause |
|---|---|
| `terminus: command not found` | Step 4 |
| `site:info` fails but `auth:whoami` works | You're not on the site's Pantheon team — ask Jason |
| Contact form returns 500 | `MONDAY_API_TOKEN` unset (step 6) |
| Lab Project pages are empty | `PCC_SITE_ID`/`PCC_TOKEN` unset (step 6) |
| `npm run test:e2e` fails immediately | `npx playwright install --with-deps chromium` |
| Env change seems ignored | Restart `npm run dev` |

Anything else: `npm run doctor` first — it names the fix.
