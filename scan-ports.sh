#!/bin/bash

# Script pour scanner les ports avec nmap
# Usage: ./scan-ports.sh [SERVER_IP]

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Vérifier les arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 <SERVER_IP>"
    echo "Exemple: $0 192.168.1.100"
    exit 1
fi

SERVER_IP=$1

print_step "🔍 Scan des ports sur $SERVER_IP"

# Vérifier si nmap est installé
if ! command -v nmap &> /dev/null; then
    print_warning "nmap n'est pas installé"
    print_message "Installation de nmap..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install nmap
    else
        # Linux
        sudo apt-get install nmap
    fi
fi

print_message "✅ nmap installé"

# Ports SSH courants à scanner
SSH_PORTS="22,2222,222,2200-2210"

print_step "🔍 Scan des ports SSH courants..."

# Scan avec nmap
echo "Scan en cours..."
nmap -p $SSH_PORTS $SERVER_IP

print_step "🔍 Scan complet des ports ouverts..."

# Scan complet des ports les plus courants
echo "Scan complet en cours..."
nmap -F $SERVER_IP

print_step "🔍 Scan détaillé des services..."

# Scan détaillé des services
echo "Scan détaillé en cours..."
nmap -sV -p $SSH_PORTS $SERVER_IP

print_message ""
print_message "📋 Résumé :"
echo "  - Ports SSH courants scannés : $SSH_PORTS"
echo "  - Scan complet des ports les plus courants"
echo "  - Identification des services"

print_message ""
print_message "🔧 Autres méthodes de scan :"

echo "1. Scan rapide :"
echo "   nmap -F $SERVER_IP"

echo "2. Scan des ports SSH spécifiques :"
echo "   nmap -p 22,2222,222 $SERVER_IP"

echo "3. Scan avec détection de version :"
echo "   nmap -sV -p 22,2222,222 $SERVER_IP"

echo "4. Scan agressif (plus lent mais plus complet) :"
echo "   nmap -A -p 22,2222,222 $SERVER_IP"

print_message ""
print_message "💡 Conseils :"
echo "  - Le port 22 est le port SSH standard"
echo "  - Le port 2222 est souvent utilisé comme alternative"
echo "  - Certains VPS utilisent des ports personnalisés"
echo "  - Vérifiez votre panneau de contrôle VPS"
