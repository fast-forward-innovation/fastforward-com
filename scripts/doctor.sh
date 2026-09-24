#!/usr/bin/env bash
#
# Verify this machine can develop, test and deploy the Fast Forward site.
#
# Mechanics:
#   Runs every check and reports all of them — it does not stop at the first
#   failure, because the point is to hand you one complete list of things to
#   fix. Each failing check prints the exact command that fixes it.
#
#   Checks are grouped: Toolchain, Git + GitHub, Pantheon, Environment, MCP,
#   Hygiene. A check is FAIL if something will not work, WARN if a feature
#   will be degraded, SKIP if a prerequisite check already failed.
#
# Usage:
#   npm run doctor
#   bash scripts/doctor.sh [-q|--quiet]
#
#   -q, --quiet   Print only non-OK lines and the summary.
#
# Exit codes:
#   0 — every required check passed (warnings are allowed)
#   1 — usage error
#   2 — local development is broken; `npm run dev` will not work
#   3 — local dev is fine, but deploy tooling (gh / terminus) is missing or
#       unauthenticated; you cannot ship or touch Pantheon environments

set -uo pipefail

# Resolve the repo root so the script works from any cwd.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1

PANTHEON_SITE="fastforward"
EXPECTED_ORIGIN="git@github.com:fast-forward-innovation/fastforward-com.git"
MCP_URL="https://mcp.content.pantheon.io"

QUIET=0
while [ $# -gt 0 ]; do
  case "$1" in
    -q|--quiet) QUIET=1; shift ;;
    -h|--help)  sed -n '2,26p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

if [ -t 1 ]; then
  C_RESET=$'\033[0m'; C_OK=$'\033[32m'; C_WARN=$'\033[33m'
  C_FAIL=$'\033[31m'; C_DIM=$'\033[2m'; C_BOLD=$'\033[1m'
else
  C_RESET=""; C_OK=""; C_WARN=""; C_FAIL=""; C_DIM=""; C_BOLD=""
fi

# Failures are tracked in two buckets so the exit code can distinguish
# "you cannot run the app" from "you cannot deploy it".
LOCAL_FAILS=0
DEPLOY_FAILS=0
WARNS=0

section() { [ "$QUIET" -eq 1 ] || printf '\n%s%s%s\n' "$C_BOLD" "$1" "$C_RESET"; }
ok()      { [ "$QUIET" -eq 1 ] || printf '  %s[ OK ]%s  %s\n' "$C_OK" "$C_RESET" "$1"; }
skip()    { [ "$QUIET" -eq 1 ] || printf '  %s[SKIP]%s  %s\n' "$C_DIM" "$C_RESET" "$1"; }
warn()    { WARNS=$((WARNS + 1)); printf '  %s[WARN]%s  %s\n' "$C_WARN" "$C_RESET" "$1"; [ -n "${2:-}" ] && printf '          %s→ fix: %s%s\n' "$C_DIM" "$2" "$C_RESET"; return 0; }

# fail <bucket: local|deploy> <message> [fix]
fail() {
  local bucket="$1" msg="$2" fix="${3:-}"
  if [ "$bucket" = "deploy" ]; then DEPLOY_FAILS=$((DEPLOY_FAILS + 1)); else LOCAL_FAILS=$((LOCAL_FAILS + 1)); fi
  printf '  %s[FAIL]%s  %s\n' "$C_FAIL" "$C_RESET" "$msg"
  [ -n "$fix" ] && printf '          %s→ fix: %s%s\n' "$C_DIM" "$fix" "$C_RESET"
  return 0
}

# Read a key's value from .env.local without sourcing the file (which would
# execute anything in it). Returns empty for missing or blank values.
env_value() {
  [ -f .env.local ] || return 0
  sed -n "s/^[[:space:]]*$1=//p" .env.local | head -1 | sed 's/^["'\'']//; s/["'\'']$//'
}

printf '%sFast Forward — environment doctor%s\n' "$C_BOLD" "$C_RESET"

# ---------------------------------------------------------------- Toolchain
section "Toolchain"

if command -v node >/dev/null 2>&1; then
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
  WANT_MAJOR="$( [ -f .nvmrc ] && tr -dc '0-9' < .nvmrc || echo 20 )"
  if [ "$NODE_MAJOR" -lt "${WANT_MAJOR:-20}" ]; then
    fail local "node $(node -v) is older than required v${WANT_MAJOR}" "nvm install ${WANT_MAJOR} && nvm use"
  else
    ok "node $(node -v) (>= v${WANT_MAJOR}, matches .nvmrc)"
  fi
else
  fail local "node is not installed" "install Node ${WANT_MAJOR:-20}+ (nvm install 20), see ONBOARDING.md"
fi

if [ ! -d node_modules ] || [ ! -f node_modules/.package-lock.json ]; then
  fail local "dependencies not installed" "npm ci"
elif [ package-lock.json -nt node_modules/.package-lock.json ]; then
  # mtime only, so a fresh `git checkout` can trip this even when nothing
  # actually changed — warn rather than block.
  warn "dependencies may be stale (package-lock.json is newer than the install)" "npm ci"
else
  ok "dependencies installed and in sync with package-lock.json"
fi

PW_CACHE="$HOME/Library/Caches/ms-playwright"
[ "$(uname -s)" != "Darwin" ] && PW_CACHE="$HOME/.cache/ms-playwright"
if [ -d "$PW_CACHE" ] && ls "$PW_CACHE" 2>/dev/null | grep -q chromium; then
  ok "Playwright chromium installed"
else
  warn "Playwright chromium not installed — npm run test:e2e will fail" "npx playwright install --with-deps chromium"
fi

# ------------------------------------------------------------ Git + GitHub
section "Git + GitHub"

ACTUAL_ORIGIN="$(git remote get-url origin 2>/dev/null)"
if [ -z "$ACTUAL_ORIGIN" ]; then
  fail local "no 'origin' remote" "git remote add origin $EXPECTED_ORIGIN"
elif [ "$ACTUAL_ORIGIN" != "$EXPECTED_ORIGIN" ]; then
  warn "origin is $ACTUAL_ORIGIN (expected $EXPECTED_ORIGIN)" "git remote set-url origin $EXPECTED_ORIGIN"
else
  ok "origin → $ACTUAL_ORIGIN"
fi

if ! command -v gh >/dev/null 2>&1; then
  fail deploy "gh (GitHub CLI) is not installed — you cannot open PRs" "brew install gh && gh auth login"
elif ! gh auth status >/dev/null 2>&1; then
  fail deploy "gh is installed but not authenticated" "gh auth login"
else
  # Ask once and reuse. A second call can fail on its own (network blip,
  # rate limit) and would otherwise render "authenticated as" with nothing.
  GH_USER="$(gh api user -q .login 2>/dev/null | tr -d '\r')"
  ok "gh authenticated${GH_USER:+ as $GH_USER}"
fi

# ----------------------------------------------------------------- Pantheon
section "Pantheon"

TERMINUS_OK=0
if ! command -v terminus >/dev/null 2>&1; then
  fail deploy "terminus is not installed" "brew install pantheon-systems/pantheon/terminus"
else
  # One call, reused for both the verdict and the label. Calling twice meant a
  # transient failure on the second could print "authenticated as" with a blank
  # name while still reporting OK.
  TERMINUS_USER="$(terminus auth:whoami 2>/dev/null | tr -d '\r' | tr -d '[:space:]')"
  if [ -z "$TERMINUS_USER" ]; then
    fail deploy "terminus is installed but not logged in" "terminus auth:login --machine-token=<token>  (dashboard.pantheon.io → Account → Machine Tokens)"
  else
    ok "terminus authenticated as $TERMINUS_USER"
    TERMINUS_OK=1
  fi
fi

if [ "$TERMINUS_OK" -eq 1 ]; then
  if terminus site:info "$PANTHEON_SITE" >/dev/null 2>&1; then
    ok "access to Pantheon site '$PANTHEON_SITE' confirmed"
  else
    fail deploy "logged in, but no access to Pantheon site '$PANTHEON_SITE'" "ask Jason to add you to the '$PANTHEON_SITE' team on Pantheon"
  fi
else
  skip "Pantheon site access (requires terminus)"
fi

# -------------------------------------------------------------- Environment
section "Environment"

# Nothing here blocks `npm run dev`: the app degrades gracefully when these are
# unset (lib/pcc.ts returns [] and logs; the contact form 500s only on submit).
# So these are warnings, not failures — a new developer can get the site running
# before chasing down any tokens.
if [ ! -f .env.local ]; then
  warn ".env.local is missing — the site runs, but the contact form and Content Publisher pages will not" "npm run sync-env"
else
  ok ".env.local present"

  if [ -n "$(env_value MONDAY_API_TOKEN)" ]; then
    ok "MONDAY_API_TOKEN set (contact form will work)"
  else
    warn "MONDAY_API_TOKEN empty — the contact form returns 500 on submit" "see .env.local.example, or ask Jason"
  fi

  PCC_MISSING=""
  for key in PCC_SITE_ID PCC_TOKEN; do
    [ -z "$(env_value "$key")" ] && PCC_MISSING="${PCC_MISSING}${PCC_MISSING:+, }$key"
  done
  if [ -n "$PCC_MISSING" ]; then
    warn "$PCC_MISSING empty — Content Publisher pages will not render" "see .env.local.example, or ask Jason"
  else
    ok "PCC_SITE_ID and PCC_TOKEN set"
  fi

  # Drift detector: keys documented in the example but absent from .env.local.
  if [ -f .env.local.example ]; then
    DRIFT=""
    while IFS= read -r key; do
      grep -qE "^[[:space:]]*${key}=" .env.local || DRIFT="${DRIFT}${DRIFT:+, }${key}"
    done < <(grep -oE '^[A-Z_]+=' .env.local.example | tr -d '=')
    if [ -n "$DRIFT" ]; then
      warn "documented in .env.local.example but absent from .env.local: $DRIFT" "npm run sync-env"
    else
      ok "no drift between .env.local and .env.local.example"
    fi
  fi
fi

# ---------------------------------------------------------------------- MCP
section "MCP"

if [ ! -f .mcp.json ] || ! grep -q pantheon-content-publisher .mcp.json; then
  warn ".mcp.json does not declare pantheon-content-publisher" "restore .mcp.json from git"
else
  ok ".mcp.json declares pantheon-content-publisher"
  # Any HTTP response means the host is up. Unauthenticated GETs return 401,
  # so `curl -f` would be a false negative here.
  if [ -n "$(curl -s -o /dev/null -m 5 -w '%{http_code}' "$MCP_URL" 2>/dev/null | grep -E '^[1-5][0-9]{2}$')" ]; then
    ok "$MCP_URL reachable"
  else
    warn "$MCP_URL not reachable (offline, or the service is down)" "retry later; this only affects Content Publisher tooling"
  fi
  if command -v claude >/dev/null 2>&1; then
    MCP_STATUS="$(claude mcp list 2>/dev/null </dev/null | grep pantheon-content-publisher || true)"
    if printf '%s' "$MCP_STATUS" | grep -qi 'connect'; then
      ok "pantheon-content-publisher authenticated"
    else
      warn "pantheon-content-publisher not authenticated" "run /mcp in an interactive Claude Code session and authorize it"
    fi
  else
    skip "MCP auth state (claude CLI not on PATH)"
  fi
fi

# ------------------------------------------------------------------ Hygiene
section "Hygiene"

# Only flag paths under a real home directory. `/Users/<you>/…` placeholders
# in the demo docs are intentional and must not trip this.
ABS_PATHS="$(git grep -lI -E '/Users/[a-z0-9_.-]+/' -- '*.md' 2>/dev/null | tr '\n' ' ')"
if [ -n "$ABS_PATHS" ]; then
  warn "machine-specific absolute paths in tracked docs: $ABS_PATHS" "replace with repo-relative paths or remove"
else
  ok "no machine-specific absolute paths in tracked docs"
fi

# ------------------------------------------------------------------ Summary
TOTAL_FAILS=$((LOCAL_FAILS + DEPLOY_FAILS))
printf '\n'
if [ "$TOTAL_FAILS" -eq 0 ] && [ "$WARNS" -eq 0 ]; then
  printf '%sAll checks passed.%s\n' "$C_OK" "$C_RESET"
  exit 0
fi
printf '%s failed, %s warnings — see ONBOARDING.md\n' "$TOTAL_FAILS" "$WARNS"

if [ "$LOCAL_FAILS" -gt 0 ]; then
  printf '%slocal development is not working yet%s\n' "$C_FAIL" "$C_RESET"
  exit 2
fi
if [ "$DEPLOY_FAILS" -gt 0 ]; then
  printf '%slocal dev is fine; deploy tooling needs attention%s\n' "$C_WARN" "$C_RESET"
  exit 3
fi
exit 0
