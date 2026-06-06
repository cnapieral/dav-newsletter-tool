#!/bin/bash
set -e

cd /home/christian/dev/newsletter-editor

echo "=== OpenClaude Delegation (Screen Session) ==="
./monitor-system.sh

echo -e "\nStarting persistent OpenClaude session in screen 'newsletter-editor'...\n"

# Start or attach to named screen session with the full prompt
screen -dmS newsletter-editor bash -c '
  echo "OpenClaude Session started for Newsletter Editor"
  echo "Following IMPLEMENTATION-PLAN.md"
  echo "==================================="
  openclaude --bare --dangerously-skip-permissions --add-dir . --add-dir /home/christian \
    "$(cat PROMPT-FOR-OPENCLAUDE.md)"
  echo "Session ended."
  exec bash
'

echo "Session started in screen 'newsletter-editor'."
echo "To view: screen -r newsletter-editor"
echo "To detach: Ctrl+A then D"
echo "Current status:"
./monitor-system.sh
