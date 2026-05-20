---
description: Promote a commit (default = latest pantheon_test_* tag) to Pantheon's Live environment
---

You are creating and pushing a Pantheon promotion tag for the **Live** (production) environment. Be deliberate — this is the public site at https://fastforward.sh/.

The user invoked you with optional arguments via `$ARGUMENTS`. If empty, default to deploying whatever's currently at the latest `pantheon_test_*` tag. Otherwise treat the argument as a commit SHA, branch name, or tag.

## Workflow

1. **Fetch and resolve the target commit.**
   - Run `git fetch origin --tags`.
   - If `$ARGUMENTS` is non-empty, resolve it with `git rev-parse --verify <arg>^{commit}`. Bail if that fails.
   - Otherwise find the latest Test tag: `git tag -l 'pantheon_test_*' --sort=-creatordate | head -1`. Resolve that to a commit SHA. If no Test tag exists at all, bail and tell the user to deploy to Test first — Live should always follow validated Test.
   - Capture the short SHA and one-line subject.

2. **Pre-flight checks.** Make these visible to the user:
   - Is the target commit reachable from `origin/main`? Usually yes; warn if not.
   - Does the target match the latest `pantheon_test_*` tag exactly? Highlight when it matches (good — same code QA'd on Test) vs. differs (warn loudly — you're shipping something Test never validated).
   - List any other `pantheon_test_*` tags that have been pushed since the matched one, so the user knows whether they're skipping a Test promotion.

3. **Pick a unique tag name.**
   - Start with `pantheon_live_YYYYMMDD`.
   - If that tag exists on origin, suffix with `_2`, `_3`, etc. until you find an unused name.

4. **Show the full pre-flight summary** and ask for explicit confirmation. Print:
   - Tag name
   - Target commit (`<short-sha> <subject>`)
   - Match status vs. the latest Test tag
   - Live URLs that will update: `https://live-fastforward.pantheonsite.io/` and `https://fastforward.sh/`
   - Reminder: tags are immutable; to roll back, push another `pantheon_live_*` tag at an earlier commit (no `git push --force` shortcut)
   - Reminder: Pantheon takes 1–3 minutes to build and deploy

   **Require an explicit "yes" / "ship it" / similar** before proceeding. Treat hesitation or ambiguous responses as "abort."

5. **On confirmation:**
   - `git tag -a <name> <sha> -m "Promote to Live"`
   - `git push origin <name>`

6. **Report.** Include:
   - The pushed tag name + link to it on GitHub
   - Where to watch the build (Pantheon dashboard)
   - Reminder: monitor for the next 5–10 minutes; if something looks wrong on Live, roll back by tagging a known-good earlier commit with a new `pantheon_live_*` tag.

## Notes

- **Never force-push tags.** If a re-deploy is needed, use a new tag name.
- **No skipping Test in normal flow.** If the user passes `$ARGUMENTS` to deploy something that isn't on Test, warn explicitly and require them to re-confirm.
- **Working tree dirtiness is irrelevant** — tags point at committed history. If the user is conflating "what I'm working on" with "what's about to ship," surface that mismatch before tagging.
