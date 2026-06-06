#!/bin/bash
set -e

cd /home/christian/dev/newsletter-editor

echo "=== OpenClaude Delegation Workflow ==="
echo "Running GPU + Process Monitoring first..."
./monitor-system.sh
echo -e "\n=== Starting OpenClaude Session (non-interactive mode) ===\n"

# Non-interactive mode to avoid Ink/raw mode error
openclaude -p --bare \
  --dangerously-skip-permissions \
  --add-dir . \
  --add-dir /home/christian \
  "$(cat PROMPT-FOR-OPENCLAUDE.md)"

echo -e "\nSession command completed. Check output above."
echo "Use './monitor-system.sh' to check GPU/RAM/CPU status."
