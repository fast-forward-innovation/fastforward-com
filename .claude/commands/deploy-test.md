---
description: Promote a commit to Pantheon's Test environment by pushing a pantheon_test_<date> tag
---

You are creating and pushing a Pantheon promotion tag for the **Test** environment. Pantheon watches the `pantheon_test_*` tag namespace and rebuilds Test on every new tag.

The user invoked you with optional arguments via `$ARGUMENTS`. If empty, default to deploying the tip of `origin/main`. Otherwise treat the argument as a commit SHA, branch name, or tag to resolve.

## Workflow

1. **Fetch and resolve the target commit.**
   - Run `git fetch origin --tags` to pick up new tags/branches from origin without modifying the working tree.
   - If `$ARGUMENTS` is non-empty, resolve it with `git rev-parse --verify <arg>^{commit}`. Bail if that fails.
   - Otherwise the target is `origin/main`. Resolve to a SHA the same way.
   - Capture the short SHA and one-line subject for the user-facing summary.

2. **Pick a unique tag name.**
   - Start with `pantheon_test_YYYYMMDD` using today's date in UTC (or the local date — both are fine, just be consistent).
   - If that tag exists locally or on origin (`git ls-remote --tags origin pantheon_test_YYYYMMDD*`), try `pantheon_test_YYYYMMDD_2`, then `_3`, until you find an unused name. Don't force-push existing tags.

3. **Show the user what you're about to do** and ask for confirmation before any write. Print:
   - Tag name
   - Target commit (`<short-sha> <subject>`)
   - Whether the target commit is on `origin/main` (warn if not)
   - The Test URL: `https://test-fastforward.pantheonsite.io/`
   - Note: Pantheon takes 1–3 minutes to build and deploy after the push

4. **On explicit "yes" / "go" / similar confirmation:**
   - `git tag -a <name> <sha> -m "Promote to Test"`
   - `git push origin <name>`

5. **Report.** Include:
   - The pushed tag name
   - The Test URL
   - A link to the build log in the Pantheon dashboard if the user wants it (just remind them where to look — don't fetch it)
   - Reminder that tags are immutable; a redeploy requires a new tag (which is why step 2 picks a suffix).

## Notes

- Working tree dirtiness doesn't matter — tags point at committed history. But if the user is asking to deploy "what I just changed" and there are uncommitted changes, flag it: those changes won't be in the tag.
- Never force-push tags. If a re-deploy of the exact same commit is needed, use a fresh tag name (the `_2`, `_3` suffix logic).
