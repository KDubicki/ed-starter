#!/usr/bin/env bash
# PostToolUse Hook — Self-Healing Loop
# After file edits, runs typecheck + lint and reports errors back to agent.
# Agent receives errors as systemMessage and auto-fixes them.

set -uo pipefail

INPUT=$(cat)
PROJECT_DIR="/Users/kdubicki/Documents/Ewolucja-developera/ed-starter"

# Extract tool name
TOOL_NAME=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('toolName',''))" 2>/dev/null || echo "")

# Only trigger after file edit operations
if [[ "$TOOL_NAME" != "replace_string_in_file" && "$TOOL_NAME" != "create_file" && "$TOOL_NAME" != "multi_replace_string_in_file" ]]; then
  exit 0
fi

# Extract the file path that was edited
FILE_PATH=$(echo "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
params = d.get('toolInput', {})
# Handle both single file and multi-file edits
path = params.get('filePath', '')
if not path:
    replacements = params.get('replacements', [])
    if replacements:
        path = replacements[0].get('filePath', '')
print(path)
" 2>/dev/null || echo "")

# Only check TypeScript/TSX files
if [[ ! "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
  exit 0
fi

cd "$PROJECT_DIR" || exit 0

# ─── Run TypeScript check ────────────────────────────────────────────────────
TYPECHECK_OUTPUT=$(npx tsc --noEmit 2>&1)
TYPECHECK_EXIT=$?

# ─── Run ESLint on the edited file ──────────────────────────────────────────
RELATIVE_PATH="${FILE_PATH#$PROJECT_DIR/}"
LINT_OUTPUT=$(npx eslint "$RELATIVE_PATH" 2>&1)
LINT_EXIT=$?

# ─── Compose feedback ───────────────────────────────────────────────────────
ERRORS=""

if [[ $TYPECHECK_EXIT -ne 0 ]] || echo "$TYPECHECK_OUTPUT" | grep -q "error TS"; then
  RELEVANT_ERRORS=$(echo "$TYPECHECK_OUTPUT" | grep -A2 "error TS" | head -30)
  if [[ -n "$RELEVANT_ERRORS" ]]; then
    ERRORS="$ERRORS\n\n🔴 TypeScript errors after editing $RELATIVE_PATH:\n$RELEVANT_ERRORS"
  fi
fi

if [[ $LINT_EXIT -ne 0 ]]; then
  ERRORS="$ERRORS\n\n🟡 ESLint issues in $RELATIVE_PATH:\n$LINT_OUTPUT"
fi

# If errors found, send them back as system message for self-healing
if [[ -n "$ERRORS" ]]; then
  ESCAPED_ERRORS=$(printf '%s' "$ERRORS" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")

  echo "{\"systemMessage\": \"SELF-HEALING LOOP ACTIVATED — The following errors were detected after your edit. Fix them before proceeding:\n$ERRORS\"}"
  exit 0
fi

# All clean
exit 0
