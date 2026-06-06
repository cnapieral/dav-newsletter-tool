#!/bin/bash
# System Monitoring for OpenClaude / AI Sessions with colors
# Green = Good/Idle, Yellow = Warning, Red = High Load / Model Active

RESET="\e[0m"
BOLD="\e[1m"
CYAN="\e[36m"
GREEN="\e[32m"
YELLOW="\e[33m"
RED="\e[31m"
BLUE="\e[34m"

echo -e "${CYAN}${BOLD}=== OpenClaude / AI System Monitoring ===${RESET}"
echo -e "Zeit: $(date)"
echo -e "${CYAN}========================================${RESET}\n"

# 1. GPU
echo -e "${BLUE}1. GPU Status (nvidia-smi)${RESET}"
nvidia-smi --query-gpu=index,name,memory.used,memory.total,utilization.gpu --format=csv,noheader,nounits

echo -e "\n${BLUE}Detailed GPU Memory:${RESET}"
nvidia-smi -q -d MEMORY | grep -A 6 "Memory Usage"

VRAM_USED=$(nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits | head -1)
VRAM_TOTAL=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -1)
if [ -n "$VRAM_USED" ] && [ -n "$VRAM_TOTAL" ]; then
    PERCENT=$((VRAM_USED * 100 / VRAM_TOTAL))
    echo -e "\nVRAM Auslastung: ${PERCENT}% (${VRAM_USED}MB / ${VRAM_TOTAL}MB)"
    if [ "$PERCENT" -gt 75 ]; then
        echo -e "${RED}→ GPU STATUS: AKTIV (Modell geladen und nicht idle)${RESET}"
        echo -e "${RED}   Hohe VRAM-Nutzung → Modell ist geladen.${RESET}"
    else
        echo -e "${GREEN}→ GPU STATUS: eher IDLE oder leicht belastet${RESET}"
    fi
fi

# 2. RAM
echo -e "\n${BLUE}2. RAM Usage (System)${RESET}"
free -h | grep -E 'Mem:|Swap:'

RAM_USED=$(free -m | awk 'NR==2 {print $3}')
RAM_TOTAL=$(free -m | awk 'NR==2 {print $2}')
if [ -n "$RAM_USED" ] && [ -n "$RAM_TOTAL" ]; then
    RAM_PERCENT=$((RAM_USED * 100 / RAM_TOTAL))
    echo -n "RAM Auslastung: ${RAM_PERCENT}% (${RAM_USED}MB / ${RAM_TOTAL}MB) "
    if [ "$RAM_PERCENT" -gt 80 ]; then
        echo -e "${RED}[KRITISCH HOCH]${RESET}"
    elif [ "$RAM_PERCENT" -gt 60 ]; then
        echo -e "${YELLOW}[MITTEL]${RESET}"
    else
        echo -e "${GREEN}[NORMAL]${RESET}"
    fi
fi

# 3. CPU
echo -e "\n${BLUE}3. CPU Load & Utilization${RESET}"
echo -e "Load Average (1/5/15min): $(uptime | awk -F'load average: ' '{print $2}')"
echo -e "\nTop CPU processes:"
top -bn1 | head -15

# 4. Relevant Processes
echo -e "\n${BLUE}4. Relevante AI / OpenClaude Prozesse${RESET}"
ps aux --sort=-%cpu | grep -E 'openclaude|python|claude|torch|cuda|llama' | grep -v grep | head -12 || echo "Keine relevanten AI-Prozesse gefunden."

# 5. GPU Processes
echo -e "\n${BLUE}5. Top GPU Processes${RESET}"
nvidia-smi --query-compute-apps=pid,process_name,used_memory --format=csv,noheader

echo -e "\n${CYAN}=== Monitoring abgeschlossen ===${RESET}"
echo -e "${GREEN}Grün${RESET}  = Normal / Idle"
echo -e "${YELLOW}Gelb${RESET}  = Mittel / Beobachten"
echo -e "${RED}Rot${RESET}    = Hoch / Modell aktiv"
echo -e "\nTipp: ${CYAN}watch -n 5 ./monitor-system.sh${RESET}"
