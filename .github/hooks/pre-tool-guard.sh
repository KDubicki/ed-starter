#!/usr/bin/env bash
# PreToolUse Hook — blocks dangerous terminal commands
# Reads JSON from stdin, checks 'command' field for forbidden patterns.
# Exit 0 = allow, exit 2 = block

set -euo pipefail

INPUT=$(cat)

# Extract the tool name from the hook input
TOOL_NAME=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('toolName',''))" 2>/dev/null || echo "")

# Only inspect terminal commands
if [[ "$TOOL_NAME" != "run_in_terminal" ]]; then
  echo '{"decision":"allow"}'
  exit 0
fi

# Extract the command being run
COMMAND=$(echo "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
params = d.get('toolInput', {})
print(params.get('command', ''))
" 2>/dev/null || echo "")

# ─── Dangerous patterns ─────────────────────────────────────────────────────
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \."
  "git push.*--force"
  "git reset --hard"
  "DROP TABLE"
  "DROP DATABASE"
  "truncate "
  "> /dev/sda"
  "mkfs\."
  ":(){ :|:& };:"
  "chmod -R 777 /"
  "dd if=/dev"
  "--no-verify"
  "sudo rm"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE -- "$pattern"; then
    echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"BLOCKED: Command matches dangerous pattern '$pattern'. Refusing to execute: $COMMAND\"}}"
    exit 2
  fi
done

# ─── Sensitive file protection ───────────────────────────────────────────────
PROTECTED_FILES=(
  "data/flights.seed.json"
  ".env"
  ".env.local"
  ".env.production"
)

for file in "${PROTECTED_FILES[@]}"; do
  if echo "$COMMAND" | grep -qE "(rm|>|truncate).*$file"; then
    echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"ask\",\"permissionDecisionReason\":\"WARNING: Command attempts to modify/delete protected file '$file'. Requires user approval.\"}}"
    exit 0
  fi
done

echo '{"decision":"allow"}'
exit 0
