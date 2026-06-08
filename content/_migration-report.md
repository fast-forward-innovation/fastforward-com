# Migration report

_Generated 2026-04-17T22:00:44.430Z_

Source: https://dev-fast-forward-cms.pantheonsite.io/wp/graphql

## Counts
- Pages: 2
- Projects (posts): 8
- Services: 14
- Unique media: 46
- Media downloaded: 46
- Media skipped (failed): 0

## Warnings (0)
_(none)_

---

## Operations notes

_Hand-edited. **Heads up:** re-running `scripts/export-wp-to-markdown.mjs` overwrites this entire file — there is no preserve-on-rerun behavior. WP is being decommissioned post-cutover so a re-run is unlikely, but if you do re-run, copy this section out first._

### Pull-request workflow (added 2026-04-18)

Direct pushes to `main` are blocked at the harness level — the BLOCK rule overrides even explicit user direction (`Pushing directly to the default branch (main) bypasses PR review`). All changes ship via PR, even single-commit docs edits.

**Standard flow:**

```bash
git checkout -b <type>/<short-slug>     # feat/, fix/, docs/, chore/
# …commits…
git push -u origin <branch>
gh pr create --base main --head <branch> --title "<conventional-commit-style title>" --body "..."
```

- `gh` CLI is installed locally (`brew install gh`) and authorized against `fast-forward-innovation/fastforward-com`.
- Branch naming follows the conventional-commit prefixes already used in our git log (`feat:`, `fix:`, `docs:`, `chore:`).
- For one-line docs/typo fixes, still go through a PR — the BLOCK rule does not have a small-change exception.

**Reference:** PR #1 (`docs/expand-readme`) is the first PR opened against this repo and is a working example of the flow.

**What this means for Pantheon Dev deploys:** Pantheon's auto-deploy is wired to commits on `main`, not to PR branches. So a PR sitting open does not preview on Dev.  It previews on a PR environmen — Dev only updates after merge. If you need to QA a branch on Pantheon before merging, use Multidev (one environment per branch) per [Pantheon Next.js docs](https://docs.pantheon.io/nextjs).

For content reviews, you can use a persistent mutli dev by naming a branch `multi-<env>`, but these won't be PRs.
