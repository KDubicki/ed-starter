# Copilot Agent Hooks — Self-Healing Loop

This project uses **Copilot Chat hooks** to enforce code quality automatically during agent sessions.

## Configured Hooks

### PreToolUse — `pre-tool-guard.sh`

**Purpose:** Blocks dangerous terminal operations before they execute.

**Blocked patterns:**

- `rm -rf /`, `rm -rf ~`, `rm -rf .`
- `git push --force`, `git reset --hard`
- `DROP TABLE`, `DROP DATABASE`
- `--no-verify` (bypass safety checks)
- `sudo rm`, `chmod -R 777 /`
- Fork bombs, disk wipes

**Protected files** (require user confirmation):

- `data/flights.seed.json`
- `.env`, `.env.local`, `.env.production`

### PostToolUse — `post-edit-validate.sh`

**Purpose:** Self-healing loop. After every `.ts`/`.tsx` file edit, automatically runs:

1. `tsc --noEmit` — TypeScript type checking
2. `eslint <file>` — Linting on the edited file

If errors are detected, the hook returns a `systemMessage` instructing the agent to fix them before proceeding. This creates an automatic feedback loop:

```
Agent edits file → Hook runs typecheck/lint → Errors found →
→ Agent receives error details → Agent fixes → Hook re-validates → Clean ✓
```

## How It Works

```
┌─────────────────────────────────────────────────────┐
│                  Agent Session                        │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────┐     ┌─────────────────────┐       │
│  │ PreToolUse   │────▶│ Block/Allow/Ask      │       │
│  │ Guard        │     │ dangerous commands   │       │
│  └──────────────┘     └─────────────────────┘       │
│                                                       │
│  ┌──────────────┐     ┌─────────────────────┐       │
│  │ PostToolUse  │────▶│ typecheck + lint     │       │
│  │ Validate     │     │ → systemMessage      │       │
│  └──────────────┘     │ → agent auto-fixes   │       │
│                        └─────────────────────┘       │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## Testing Hooks Manually

```bash
# Test PreToolUse (should BLOCK):
echo '{"toolName":"run_in_terminal","toolInput":{"command":"rm -rf /"}}' | ./.github/hooks/pre-tool-guard.sh

# Test PreToolUse (should ALLOW):
echo '{"toolName":"run_in_terminal","toolInput":{"command":"npm run build"}}' | ./.github/hooks/pre-tool-guard.sh

# Test PostToolUse (introduce TS error, then run):
echo '{"toolName":"replace_string_in_file","toolInput":{"filePath":"lib/utils.ts"}}' | ./.github/hooks/post-edit-validate.sh
```
