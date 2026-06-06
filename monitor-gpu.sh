#!/bin/bash
# GPU + Process Monitoring for OpenClaude / AI Sessions
# Full VRAM = Model loaded and active (not idle)

echo "=== OpenClaude / AI GPU Monitoring ==="
echo "Zeit: $(date)"
echo "====================================="

# 1. NVIDIA GPU Status
echo "GPU Status (nvidia-smi):"
nvidia-smi --query-gpu=index,name,memory.used,memory.total,utilization.gpu --format=csv,noheader,nounits

echo -e "\nDetailed Memory Usage:"
nvidia-smi -q -d MEMORY | grep -A 5 "Memory Usage"

# Calculate VRAM usage percentage
VRAM_USED=$(nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits | head -1)
VRAM_TOTAL=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -1)
if [ -n "$VRAM_USED" ] && [ -n "$VRAM_TOTAL" ]; then
    PERCENT=$((VRAM_USED * 100 / VRAM_TOTAL))
    echo -e "\nVRAM Auslastung: ${PERCENT}% (${VRAM_USED}MB / ${VRAM_TOTAL}MB)"
    
    if [ "$PERCENT" -gt 75 ]; then
        echo "→ STATUS: GPU AKTIV (Modell geladen und nicht idle)"
        echo "   Hohe VRAM-Nutzung deutet auf ein geladenes Modell hin."
    else
        echo "→ STATUS: GPU eher IDLE oder leicht belastet"
    fi
fi

# 2. Running Processes related to AI / OpenClaude
echo -e "\nRelevante Prozesse:"
ps aux | grep -E 'openclaude|python|claude|torch|cuda' | grep -v grep || echo "Keine relevanten AI-Prozesse gefunden."

echo -e "\nTop GPU Processes (nvidia-smi):"
nvidia-smi --query-compute-apps=pid,process_name,used_memory --format=csv,noheader

echo -e "\nMonitoring abgeschlossen. Voller VRAM = Modell aktiv."
echo "Tipp: Dieses Script kann in einer Schleife laufen (watch -n 5 ./monitor-gpu.sh)"
