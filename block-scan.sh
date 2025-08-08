#!/bin/bash

# Script pour scanner par blocs de 1000 ports
# Usage: ./block-scan.sh [SERVER_IP] [START_PORT] [END_PORT]

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
    echo "Usage: $0 <SERVER_IP> [START_PORT] [END_PORT]"
    echo "Exemple: $0 192.168.1.100"
    echo "Exemple: $0 192.168.1.100 50000 51000"
    exit 1
fi

SERVER_IP=$1
START_PORT=${2:-50000}
END_PORT=${3:-60000}

print_step "🔍 Scan par blocs de $SERVER_IP (ports $START_PORT-$END_PORT)"

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

# Calculer le nombre de blocs
BLOCK_SIZE=1000
TOTAL_PORTS=$((END_PORT - START_PORT + 1))
TOTAL_BLOCKS=$((TOTAL_PORTS / BLOCK_SIZE + 1))

print_message "📊 Scan de $TOTAL_PORTS ports en $TOTAL_BLOCKS blocs de $BLOCK_SIZE ports"

found_ports=()
current_block=0

for ((start=START_PORT; start<=END_PORT; start+=BLOCK_SIZE)); do
    current_block=$((current_block + 1))
    end=$((start + BLOCK_SIZE - 1))
    
    if [ $end -gt $END_PORT ]; then
        end=$END_PORT
    fi
    
    print_step "🔍 Bloc $current_block/$TOTAL_BLOCKS : ports $start-$end"
    
    # Scan du bloc
    echo "Scan en cours..."
    result=$(nmap -Pn -p $start-$end $SERVER_IP 2>/dev/null | grep -E "(open|ssh)" || true)
    
    if [ ! -z "$result" ]; then
        print_message "✅ Ports ouverts trouvés dans le bloc $start-$end :"
        echo "$result"
        
        # Extraire les ports ouverts
        open_ports=$(echo "$result" | grep -oE "[0-9]+/tcp" | cut -d'/' -f1)
        for port in $open_ports; do
            found_ports+=($port)
        done
    else
        print_message "❌ Aucun port ouvert dans le bloc $start-$end"
    fi
    
    echo ""
done

print_message ""
print_message "📋 Résumé du scan :"

if [ ${#found_ports[@]} -eq 0 ]; then
    print_error "❌ Aucun port ouvert trouvé"
    print_message "🔧 Suggestions :"
    echo "  1. Vérifiez votre panneau de contrôle VPS"
    echo "  2. Consultez l'email de création du serveur"
    echo "  3. Contactez votre fournisseur VPS"
    echo "  4. Essayez un scan plus large"
else
    print_message "✅ Ports ouverts trouvés :"
    for port in "${found_ports[@]}"; do
        echo "  🟢 Port $port"
    done
    
    print_message ""
    print_message "🔧 Pour tester les ports SSH :"
    echo "  ./quick-ssh-scan.sh $SERVER_IP VOTRE_UTILISATEUR"
fi

print_message ""
print_message "💡 Conseils :"
echo "  - Chaque bloc prend 1-2 minutes"
echo "  - Utilisez Ctrl+C pour arrêter"
echo "  - Les ports SSH sont souvent dans les premiers blocs"
echo "  - Vérifiez votre panneau de contrôle VPS"
