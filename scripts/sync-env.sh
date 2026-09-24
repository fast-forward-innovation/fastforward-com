#!/usr/bin/env bash
#
# Reconcile .env.local against the authoritative key list in Pantheon Secrets
# Manager.
#
# IMPORTANT — what this does and does not do:
#   Pantheon Secrets Manager is WRITE-ONLY. `terminus secret:site:list` returns
#   every secret's name but a null value, and `secret:site:local-generate`
#   emits a template for you to fill in by hand. There is no supported way to
#   read a secret's value back out.
#
#   So this script syncs the SET OF KEYS, never the values: it tells you
#   exactly which variables production expects, seeds the ones you are missing
#   as empty entries, and reports which still need a value. Getting the values
#   is a human step — see ONBOARDING.md.
#
# Mechanics:
#   1. Verify terminus is installed, logged in, and has access to the site.
#   2. Read the site's secret NAMES.
#   3. Seed .env.local from .env.local.example if it does not exist, so the
#      comments explaining each variable survive.
#   4. Append any key Pantheon defines that .env.local is missing, as `KEY=`.
#   5. Report which keys are still empty. Values are never printed.
#
# Usage:
#   bash scripts/sync-env.sh [--site <name>]
#
# Exit codes:
#   0 — .env.local has a value for every key Pantheon defines
#   1 — usage error
#   2 — terminus missing or not logged in
#   3 — no access to the site, or keys are still missing values

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1

SITE="fastforward"
while [ $# -gt 0 ]; do
  case "$1" in
    --site)    SITE="${2:-}"; shift 2 ;;
    -h|--help) sed -n '2,33p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

if ! command -v terminus >/dev/null 2>&1; then
  cat >&2 <<'EOF'
terminus is not installed.

  brew install pantheon-systems/pantheon/terminus

Then log in with a machine token from dashboard.pantheon.io → Account →
Machine Tokens and re-run this script. See ONBOARDING.md.
EOF
  exit 2
fi

if ! terminus auth:whoami >/dev/null 2>&1; then
  cat >&2 <<'EOF'
terminus is installed but not logged in.

  terminus auth:login --machine-token=<token>

Create a token at dashboard.pantheon.io → Account → Machine Tokens (it is
shown only once). See ONBOARDING.md.
EOF
  exit 2
fi

echo "Reading secret names for Pantheon site '${SITE}'…"
KEYS="$(terminus secret:site:list "$SITE" --field=name 2>/dev/null | tr -d '\r' | grep -E '^[A-Z][A-Z0-9_]*$')"

if [ -z "$KEYS" ]; then
  cat >&2 <<EOF
Could not read secret names for site '${SITE}'.

You are logged in as $(terminus auth:whoami 2>/dev/null), but that account may
not have access to this site. Ask Jason to add you to the '${SITE}' team on
Pantheon, then re-run this script.
EOF
  exit 3
fi

if [ ! -f .env.local ]; then
  if [ -f .env.local.example ]; then
    cp .env.local.example .env.local
    echo "Created .env.local from .env.local.example"
  else
    : > .env.local
    echo "Created empty .env.local"
  fi
fi

ADDED=""
for key in $KEYS; do
  if ! grep -qE "^[[:space:]]*${key}=" .env.local; then
    # Activate a commented-out entry if the example file had one, else append.
    if grep -qE "^[[:space:]]*#[[:space:]]*${key}=" .env.local; then
      # shellcheck disable=SC2016
      sed -i.bak -E "s|^[[:space:]]*#[[:space:]]*(${key})=.*|\1=|" .env.local && rm -f .env.local.bak
    else
      printf '%s=\n' "$key" >> .env.local
    fi
    ADDED="${ADDED}${ADDED:+, }${key}"
  fi
done

# Cloudflare publishes an "always passes" Turnstile test pair. These are public
# test credentials, safe to commit, and they make the contact form work locally
# without a Cloudflare account. Only ever fill them in when the key is empty.
set_local_default() {
  local key="$1" default="$2"
  local current
  current="$(sed -n "s/^[[:space:]]*${key}=//p" .env.local | head -1)"
  if [ -z "$current" ]; then
    sed -i.bak -E "s|^[[:space:]]*(${key})=.*|\1=${default}|" .env.local && rm -f .env.local.bak
    DEFAULTED="${DEFAULTED}${DEFAULTED:+, }${key}"
  fi
}
DEFAULTED=""
set_local_default NEXT_PUBLIC_TURNSTILE_SITE_KEY 1x00000000000000000000AA
set_local_default TURNSTILE_SECRET_KEY 1x0000000000000000000000000000000AA

EMPTY=""
for key in $KEYS; do
  value="$(sed -n "s/^[[:space:]]*${key}=//p" .env.local | head -1)"
  [ -z "$value" ] && EMPTY="${EMPTY}${EMPTY:+, }${key}"
done

echo
echo "Pantheon defines $(printf '%s\n' $KEYS | wc -l | tr -d ' ') secrets for '${SITE}'."
[ -n "$ADDED" ] && echo "  added to .env.local:  ${ADDED}"
[ -n "$DEFAULTED" ] && echo "  Cloudflare test keys: ${DEFAULTED}"

if [ -n "$EMPTY" ]; then
  cat <<EOF
  still need a value:  ${EMPTY}

Pantheon does not hand out secret values — they are write-only. Get them from
the source for each service (see the comments in .env.local.example), or ask
Jason. Then re-run:

  npm run doctor
EOF
  exit 3
fi

echo "  every key has a value."
echo
echo "Verify with: npm run doctor"
