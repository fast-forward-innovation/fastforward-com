---
description: Push a feature branch and open a PR so Pantheon spins up a preview environment
---

You are deploying a feature branch to a Pantheon Next.js preview environment.
Pantheon auto-creates a preview env for every open GitHub PR — the deploy is
just "branch + PR".

The branch name is the argument to this command. If no name was given, ask the
user for one before doing anything else.

## Steps

1. **Identify what to include.** Run `git status --short` and `git diff --stat`.
   The working tree may contain unrelated work-in-progress (untracked dirs from
   other sessions, sibling features, etc.). List what you propose to include
   for *this* feature branch and confirm with the user before staging anything.
   When in doubt, exclude — the caller can always re-run with more files.

2. **Commit on the named branch.** Switch to (or create) the branch. Stage
   only the files the user confirmed in step 1 — never `git add -A` or `git
   add .`. Write a commit message that describes the change, not the
   mechanics ("update Pantheon project page with architecture diagrams", not
   "stage files for content-review"). Do not commit `.env*`, credentials,
   or anything in `.claude/settings.local.json`.

3. **Run the deploy script.**

   ```bash
   scripts/deploy-feature-branch.sh <branch-name> \
     -m "<PR title>" \
     -b "<PR body>"
   ```

   The script handles the push, PR creation, and the "PR already exists"
   case (re-deploy from new commits onto the same preview env).

4. **Report the PR URL** to the user. The Pantheon preview environment URL
   will appear in the PR's checks list once Pantheon's build finishes
   (usually 1–3 minutes). Do not promise a specific URL shape — read it
   from the PR's checks when the user asks.

## Guardrails

- Pushing and opening a PR are shared-state actions. Confirm the file list
  and the branch name with the user before running the script.
- Never push directly to `main` from this command. The script already
  refuses, but the orchestrator should also refuse.
- If the working tree is dirty after step 2 (e.g., a pre-commit hook
  rewrote files), commit the new changes too — never `--no-verify`.
- If the branch already has an open PR, the script will print its URL and
  exit; that is the expected re-deploy path, not an error.
