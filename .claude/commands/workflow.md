---
description: Deploy content to Pantheon via GitHub PR and track its editorial state (Draft → Review → Revisions → Approved → Live)
---

You are managing the **deploy + editorial workflow** for Fast Forward content
(`content/pages/*.mdx` and `content/projects/*.mdx`).

The workflow has five states, recorded in each MDX file's frontmatter under an
`editorial:` block:

| State | Meaning | Where it lives |
| --- | --- | --- |
| `draft` | Being authored locally. No PR yet. | Local working tree |
| `review` | Pushed to a feature branch with an open PR. Pantheon preview env up. | Feature branch + open PR |
| `revisions` | Reviewer requested changes; back to author. | Feature branch + open PR |
| `approved` | Reviewer signed off; queued to merge. | Feature branch + open PR |
| `live` | Merged to `main`; deployed to production. | `main` (no `editorial` block needed) |

Pantheon auto-creates a preview environment for every open PR; the deploy half
of this skill is just "branch + PR" via
[scripts/deploy-feature-branch.sh](scripts/deploy-feature-branch.sh).

## Frontmatter shape

Add (or update) this block at the **top level** of the MDX frontmatter on each
file moving through the workflow:

```yaml
editorial:
  status: review              # draft | review | revisions | approved | live
  branch: content-review      # branch the change rides on; null when draft/live
  pr: 42                      # PR number; null when draft/live
  updated: 2026-05-11         # ISO date of the last status change
  reviewers: ["jason"]        # optional, free-form
  notes: "Stakeholder wants the closing line sharpened."  # optional
```

The `editorial` block is **not** part of the Page/Project TypeScript schema in
[lib/types.ts](lib/types.ts) — `gray-matter` parses it but the renderer
ignores it. When a file reaches `live`, **remove the `editorial` block
entirely** so production MDX stays clean. State for live content is implicit:
present on `main`, no `editorial` block.

## Subcommands

The skill takes a verb as its argument. If no verb is given, default to
`status`.

### `/workflow status`

Print a reconciled table of every MDX file in `content/pages/` and
`content/projects/` along with its current editorial state. Read each file's
frontmatter for the declared state, then cross-check against `gh`:

- If `editorial.pr` is set, run `gh pr view <pr> --json state,reviewDecision`
  and surface mismatches (e.g., frontmatter says `review` but the PR was
  merged).
- If `editorial` is absent, infer `live` (file exists on `main`) or `draft`
  (untracked / locally modified, no PR).

Output columns: `slug | type | status | branch | PR | last updated | notes`.
Group by status, most-recently-updated first within each group.

### `/workflow review [<slug>…]`

Move one or more pieces from `draft` → `review`.

1. **Identify what to include.** If slugs were given, scope to those files. If
   not, run `git status --short` and propose the modified MDX files (and their
   associated images under `public/content/images/<slug>/`). Confirm the file
   list with the user before staging anything. **Never `git add -A` or `git
   add .`**.
2. **Determine the branch.** If a feature branch is already checked out and
   has commits ahead of `main`, reuse it. Otherwise ask the user for a
   branch name (kebab-case, descriptive: `content-museum-experiences-draft`,
   not `update-1`).
3. **Update frontmatter.** For each affected MDX, set:
   - `editorial.status: review`
   - `editorial.branch: <branch>`
   - `editorial.updated: <today's ISO date>`
   - leave `editorial.pr` blank for now (filled in step 5).
4. **Commit and push.** Commit on the named branch with a message that
   describes the editorial change ("send Museum Experiences page for
   stakeholder review", not "update frontmatter"). Then run:
   ```bash
   scripts/deploy-feature-branch.sh <branch> -m "<PR title>" -b "<PR body>"
   ```
5. **Record the PR.** Read the PR number from `gh pr view <branch> --json
   number -q .number`, then update each affected MDX's `editorial.pr` field.
   Commit that update on the same branch and push (one extra commit; the
   preview env redeploys automatically).
6. **Report** the PR URL and the slugs now in `review`.

### `/workflow revisions [<slug>…]`

Move one or more pieces from `review` (or `approved`) → `revisions`. Use this
when a reviewer kicks something back.

1. Pull the PR review comments with
   `gh pr view <pr> --json reviews,comments --jq ...` and summarize them for
   the user.
2. For each affected MDX, set:
   - `editorial.status: revisions`
   - `editorial.updated: <today's ISO date>`
   - `editorial.notes: <one-line summary of the reviewer ask>` (overwrite
     prior notes; the PR is the durable record).
3. Commit on the same branch with a message like "mark <slug> for revisions:
   <one-line ask>". Push so the preview env stays current.
4. Report what needs to change and on which files. Do **not** auto-edit the
   content — the user (or a follow-up turn) does that.

### `/workflow approved [<slug>…]`

Move one or more pieces from `review` (or `revisions`) → `approved`. Use this
only after the stakeholder has explicitly signed off (e.g., approved the PR
on GitHub, or said "ship it" in chat).

1. Verify via `gh pr view <pr> --json reviewDecision` that the PR review
   state is `APPROVED`, or confirm with the user if the approval came
   out-of-band.
2. For each affected MDX, set:
   - `editorial.status: approved`
   - `editorial.updated: <today's ISO date>`
   - clear `editorial.notes` (the open ask is resolved).
3. Commit + push. Do **not** merge — that's `publish`.

### `/workflow publish [<slug>…]`

Merge the PR and move pieces from `approved` → `live`. This is the
production-deploy step.

1. **Confirm with the user before merging.** This is a shared-state action.
2. Verify each named slug is at `approved` in its frontmatter. Refuse to
   publish anything still at `review` or `revisions` — surface what's
   blocking and stop.
3. **Strip the `editorial` block** from each affected MDX (live content
   carries no editorial metadata). Commit that change on the feature branch
   first so it's part of the merge.
4. Merge the PR with `gh pr merge <pr> --squash --delete-branch` (or
   `--merge` if the repo's default is non-squash — check
   `gh repo view --json mergeCommitAllowed,squashMergeAllowed`).
5. Switch back to `main`, pull, and report the merged PR URL and the slugs
   now `live`.

### `/workflow draft <slug>`

Reset a piece back to `draft` — remove the `editorial` block from the named
MDX(s). Use rarely (e.g., abandoning a review cycle and starting over). Does
not touch the branch or PR; the user is responsible for closing the PR
manually if they want it gone.

## Guardrails

- **PR-only workflow.** Never push directly to `main`. The deploy script and
  the harness both refuse; this skill also refuses.
- **Confirm shared-state actions.** Pushing, opening PRs, merging, and
  closing PRs all need explicit user confirmation, even in auto mode.
- **Never `--no-verify`.** If a pre-commit hook rewrites files, commit the
  rewrite as a follow-up commit. If a hook fails, fix the underlying issue.
- **Never commit secrets.** Skip `.env*`, credentials, and
  `.claude/settings.local.json`.
- **Multiple pieces, one PR is fine.** A single feature branch / PR can ship
  multiple MDX files. Record the same `branch` and `pr` on each affected
  file. The deploy script handles "PR already exists" as a re-deploy.
- **Trust frontmatter; verify against `gh`.** When the two disagree (e.g.,
  frontmatter says `review` but the PR is merged), surface the conflict and
  ask the user which is correct before writing.
- **Don't invent reviewers or notes.** Only write `editorial.reviewers` or
  `editorial.notes` when the user supplies the value.
