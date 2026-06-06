#!/bin/bash
set -e

echo "=== OpenClaude gRPC Delegation (Stable Headless Mode) ==="
cd /home/christian/dev/newsletter-editor

echo "Running system monitoring first..."
./monitor-system.sh

echo -e "\nStarting OpenClaude session via gRPC client...\n"

cd /home/christian/git/openclaude

npm run dev:grpc:cli -- --name "newsletter-editor" \
  --bare \
  --dangerously-skip-permissions \
  --add-dir /home/christian/dev/newsletter-editor \
  --add-dir /home/christian \
  --prompt-file /home/christian/dev/newsletter-editor/PROMPT-FOR-OPENCLAUDE.md

echo -e "\nSession started via gRPC. Use the gRPC CLI or check logs for progress."
echo "Monitor with: ./monitor-system.sh in the newsletter-editor directory."
