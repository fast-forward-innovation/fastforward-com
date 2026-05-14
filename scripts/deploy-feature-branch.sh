#!/usr/bin/env bash
#
# Deploy a feature branch to a Pantheon Next.js preview environment.
#
# Mechanics:
#   1. Switch to (or create) the named branch.
#   2. Verify the working tree is clean — this script does not commit; the
#      caller is responsible for staging and committing exactly what should
#      ship on the preview env.
#   3. Verify there is at least one commit ahead of the default branch.
#   4. Push the branch to origin (creating upstream tracking if needed).
#   5. Open a PR if one does not already exist for the branch. Pantheon
#      auto-creates a preview environment for every open PR; the URL
#      surfaces in the PR's checks once the build completes.
#
# Usage:
#   scripts/deploy-feature-branch.sh <branch-name> [-m "PR title"] [-b "PR body"]
#
# Exit codes:
#   0 — pushed and (PR opened OR PR already existed)
#   1 — usage error
#   2 — uncommitted changes; commit first
#   3 — branch has no commits ahead of default; nothing to deploy

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <branch-name> [-m \"PR title\"] [-b \"PR body\"]" >&2
  exit 1
fi

BRANCH="$1"
shift

PR_TITLE=""
PR_BODY=""
while [ $# -gt 0 ]; do
  case "$1" in
    -m|--title) PR_TITLE="$2"; shift 2 ;;
    -b|--body)  PR_BODY="$2";  shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

git rev-parse --git-dir >/dev/null
git remote get-url origin >/dev/null

CURRENT="$(git symbolic-ref --short HEAD)"
if [ "$CURRENT" != "$BRANCH" ]; then
  if git show-ref --quiet --heads "$BRANCH"; then
    git switch "$BRANCH"
  else
    git switch -c "$BRANCH"
  fi
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Uncommitted changes in working tree — commit them first." >&2
  git status --short >&2
  exit 2
fi

DEFAULT_BRANCH="$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's@^origin/@@' || echo main)"
git fetch origin "$DEFAULT_BRANCH" --quiet
AHEAD="$(git rev-list --count "origin/${DEFAULT_BRANCH}..HEAD")"
if [ "$AHEAD" -eq 0 ]; then
  echo "No commits ahead of origin/${DEFAULT_BRANCH}; nothing to deploy." >&2
  exit 3
fi

git push -u origin "$BRANCH"

EXISTING_PR_URL="$(gh pr view "$BRANCH" --json url -q .url 2>/dev/null || true)"
if [ -n "${EXISTING_PR_URL:-}" ]; then
  echo "PR already exists: ${EXISTING_PR_URL}"
  echo "Pantheon will redeploy the preview env from the new commits."
  exit 0
fi

if [ -z "$PR_TITLE" ]; then
  PR_TITLE="$(git log -1 --pretty=%s)"
fi
if [ -z "$PR_BODY" ]; then
  PR_BODY=$'Feature branch deploy for review.\n\nPantheon will create a preview environment for this PR; the URL appears in the PR\'s checks once the build completes.'
fi

gh pr create \
  --base "$DEFAULT_BRANCH" \
  --head "$BRANCH" \
  --title "$PR_TITLE" \
  --body "$PR_BODY"
