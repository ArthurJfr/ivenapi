#!/bin/bash

# Script nmap pour scanner les ports SSH entre 50000 et 60000
# Usage: ./nmap-high-ports.sh [SERVER_IP]

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

print_step "🔍 Scan nmap des ports SSH entre 50000 et 60000 sur $SERVER_IP"

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

print_step "🔍 Test de connectivité..."

# Test de connectivité de base
if ping -c 1 $SERVER_IP > /dev/null 2>&1; then
    print_message "✅ Serveur répond aux pings"
else
    print_warning "⚠️ Serveur ne répond pas aux pings (normal pour certains VPS)"
    print_message "Utilisation de l'option -Pn pour forcer le scan..."
fi

print_step "🔍 Scan rapide des ports 50000-60000 (sans ping)..."

# Scan rapide avec nmap sans ping
echo "Scan en cours (peut prendre quelques minutes)..."
nmap -Pn -p 50000-60000 $SERVER_IP

print_step "🔍 Scan détaillé des ports ouverts..."

# Scan détaillé des ports trouvés
echo "Scan détaillé en cours..."
nmap -Pn -sV -p 50000-60000 $SERVER_IP

print_step "🔍 Scan par blocs pour plus de précision..."

# Scan par blocs de 1000 ports
for ((start=50000; start<=60000; start+=1000)); do
    end=$((start + 999))
    if [ $end -gt 60000 ]; then
        end=60000
    fi
    echo "Scan des ports $start-$end..."
    nmap -Pn -p $start-$end $SERVER_IP | grep -E "(open|ssh)"
done

print_message ""
print_message "📋 Résumé :"
echo "  - Scan de la plage 50000-60000"
echo "  - Identification des services SSH"
echo "  - Scan par blocs pour plus de précision"
echo "  - Utilisation de -Pn pour contourner les blocages"

print_message ""
print_message "🔧 Commandes manuelles :"

echo "1. Scan complet (sans ping) :"
echo "   nmap -Pn -p 50000-60000 $SERVER_IP"

echo "2. Scan avec détection de version :"
echo "   nmap -Pn -sV -p 50000-60000 $SERVER_IP"

echo "3. Scan par blocs :"
echo "   nmap -Pn -p 50000-51000 $SERVER_IP"
echo "   nmap -Pn -p 51000-52000 $SERVER_IP"
echo "   nmap -Pn -p 52000-53000 $SERVER_IP"
echo "   # etc..."

echo "4. Scan agressif (plus lent mais plus complet) :"
echo "   nmap -Pn -A -p 50000-60000 $SERVER_IP"

print_message ""
print_message "💡 Conseils :"
echo "  - Le scan peut prendre 5-15 minutes"
echo "  - Utilisez Ctrl+C pour arrêter le scan"
echo "  - L'option -Pn force le scan sans ping"
echo "  - Vérifiez votre panneau de contrôle VPS"
echo "  - Consultez la documentation de votre fournisseur"
echo "  - Les ports SSH sont souvent dans cette plage pour la sécurité"
