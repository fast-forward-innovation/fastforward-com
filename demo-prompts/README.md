# Migration demo — Claude Code slash commands

Ten pre-built slash commands that reproduce the Gatsby + WordPress → Next.js 16 port as a live demo. One command per phase. Type `/phase-0` (etc.) in a Claude Code session pointed at a fresh repo and the prompt is sent verbatim.

```
commands/
├── phase-0-scaffold.md         /phase-0-scaffold
├── phase-1-content-export.md   /phase-1-content-export
├── phase-2-loader-layout.md    /phase-2-loader-layout
├── phase-3-homepage-blocks.md  /phase-3-homepage-blocks
├── phase-4-dynamic-pages.md    /phase-4-dynamic-pages
├── phase-5-contact-form.md     /phase-5-contact-form
├── phase-6-seo.md              /phase-6-seo
├── phase-7a-preflight.md       /phase-7a-preflight
├── phase-7b-visual-qa.md       /phase-7b-visual-qa
└── phase-7c-deploy.md          /phase-7c-deploy
```

## One-time setup before the demo

The command bodies contain `<ANGLE_BRACKETED>` placeholders. Replace them all before installing the commands.

From this repo's `demo-prompts/` directory:

```bash
cd commands/

# Required
sed -i '' 's|<TARGET_DIR>|/Users/<you>/dev/demo-next-port|g'      *.md
sed -i '' 's|<WP_GRAPHQL_URL>|https://example.com/graphql|g'      *.md
sed -i '' 's|<SITE_TITLE>|Demo Site|g'                            *.md
sed -i '' 's|<SITE_DESCRIPTION>|Demo description here.|g'         *.md
sed -i '' 's|<CANONICAL_URL>|https://www.example.com|g'           *.md

# Optional — leave blank to no-op
sed -i '' 's|<GA_TRACKING_ID>||g'      *.md
sed -i '' 's|<MONDAY_BOARD_ID>||g'     *.md
```

(Linux: drop the `''` after `-i`.)

`grep '<.*>' commands/*.md` should return nothing after substitution.

## Install into the target project

Once placeholders are filled:

```bash
mkdir -p <TARGET_DIR>/.claude/commands
cp commands/*.md <TARGET_DIR>/.claude/commands/
```

Open a Claude Code session whose CWD is `<TARGET_DIR>` (or its parent for the very first phase, since `/phase-0-scaffold` creates the directory). Type `/` to confirm the phase commands appear in the picker.

## Demo flow per phase

1. Open the command file in VS Code → audience sees the prompt.
2. Switch to the Claude Code panel.
3. Type `/phase-N-<name>` and submit.
4. Claude works; the file body is what was sent.
5. Wait for the verification step at the end of the prompt to finish before moving on.

## Phase order + dependencies

| Order | Command | Depends on |
|---|---|---|
| 1 | `/phase-0-scaffold` | empty target dir |
| 2 | `/phase-1-content-export` | live WPGraphQL endpoint |
| 3 | `/phase-2-loader-layout` | content from phase 1 |
| 4 | `/phase-3-homepage-blocks` | loader from phase 2 |
| 5 | `/phase-4-dynamic-pages` | block components from phase 3 |
| 6 | `/phase-5-contact-form` | layout from phase 2 |
| 7 | `/phase-6-seo` | all routes registered |
| 8 | `/phase-7a-preflight` | everything above |
| 9 | `/phase-7b-visual-qa` | 7a green, browser open |
| 10 | `/phase-7c-deploy` | 7b green |

7a → 7b → 7c can pause between for narration. Don't skip 7a — the build-green check there catches issues that would derail the deploy.

## What's *not* in scope

- Pantheon-specific setup (multidev, Secrets Manager, promotion tags) — `/phase-7c-deploy` uses Vercel as a generic target instead.
- DNS cutover.
- Decommissioning the legacy WP backend.

Source retrospective for the original migration: [`content/_migration-prompts.md`](../content/_migration-prompts.md). Expanded prose version of these prompts: [`content/_migration-demo-prompts.md`](../content/_migration-demo-prompts.md).
