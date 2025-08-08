#!/bin/bash

# Script spécialisé pour scanner les ports OVH entre 51000 et 59100
# Usage: ./ovh-scan.sh [SERVER_IP] [SSH_USER]

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
if [ $# -lt 2 ]; then
    echo "Usage: $0 <SERVER_IP> <SSH_USER>"
    echo "Exemple: $0 51.75.124.73 ubuntu"
    exit 1
fi

SERVER_IP=$1
SSH_USER=$2

print_step "🔍 Scan OVH des ports SSH entre 51000 et 59100 sur $SERVER_IP"

# Demander le mot de passe SSH
echo -n "Entrez le mot de passe SSH: "
read -s SSH_PASSWORD
echo ""

# Ports SSH probables pour OVH dans la plage 51000-59100
OVH_PROBABLE_PORTS=(
    51022 51122 51222 51322 51422 51522 51622 51722 51822 51922
    52022 52122 52222 52322 52422 52522 52622 52722 52822 52922
    53022 53122 53222 53322 53422 53522 53622 53722 53822 53922
    54022 54122 54222 54322 54422 54522 54622 54722 54822 54922
    55022 55122 55222 55322 55422 55522 55622 55722 55822 55922
    56022 56122 56222 56322 56422 56522 56622 56722 56822 56922
    57022 57122 57222 57322 57422 57522 57622 57722 57822 57922
    58022 58122 58222 58322 58422 58522 58622 58722 58822 58922
    59022 59122
    51000 51100 51200 51300 51400 51500 51600 51700 51800 51900
    52000 52100 52200 52300 52400 52500 52600 52700 52800 52900
    53000 53100 53200 53300 53400 53500 53600 53700 53800 53900
    54000 54100 54200 54300 54400 54500 54600 54700 54800 54900
    55000 55100 55200 55300 55400 55500 55600 55700 55800 55900
    56000 56100 56200 56300 56400 56500 56600 56700 56800 56900
    57000 57100 57200 57300 57400 57500 57600 57700 57800 57900
    58000 58100 58200 58300 58400 58500 58600 58700 58800 58900
    59000 59100
)

print_message "🔍 Test de ${#OVH_PROBABLE_PORTS[@]} ports OVH probables..."

found_ports=()
tested_count=0

for port in "${OVH_PROBABLE_PORTS[@]}"; do
    tested_count=$((tested_count + 1))
    
    # Afficher le progrès
    if [ $((tested_count % 20)) -eq 0 ]; then
        progress=$((tested_count * 100 / ${#OVH_PROBABLE_PORTS[@]}))
        echo -ne "\r🔍 Progression: $progress% ($tested_count/${#OVH_PROBABLE_PORTS[@]} ports testés)"
    fi
    
    # Test de connexion avec timeout court
    if timeout 2 sshpass -p "$SSH_PASSWORD" ssh -p $port -o ConnectTimeout=1 -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP "echo 'OK'" 2>/dev/null; then
        echo ""
        echo -e "  ${GREEN}✅ Port $port - SSH accessible${NC}"
        found_ports+=($port)
        
        # Test complet immédiat sur le premier port trouvé
        print_message "🚀 Test complet sur le port $port..."
        if sshpass -p "$SSH_PASSWORD" ssh -p $port -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP << 'EOF'
            echo "✅ Connexion SSH réussie"
            echo "📋 Informations système :"
            echo "  - OS: $(lsb_release -d | cut -f2 2>/dev/null || echo 'Non détecté')"
            echo "  - Architecture: $(uname -m)"
            echo "  - Docker: $(docker --version 2>/dev/null || echo 'Non installé')"
            echo "  - Docker Compose: $(docker-compose --version 2>/dev/null || echo 'Non installé')"
EOF
        then
            print_message "✅ Port SSH OVH trouvé et testé : $port"
            echo ""
            print_message "📋 Commandes pour déployer :"
            echo "  ./test-deployment.sh $SERVER_IP $SSH_USER $port"
            echo "  ./setup-server.sh $SERVER_IP $SSH_USER $port"
            exit 0
        fi
    fi
done

echo ""
echo ""

if [ ${#found_ports[@]} -eq 0 ]; then
    print_error "❌ Aucun port SSH trouvé dans les ports OVH probables"
    print_message "🔧 Scan par blocs avec nmap :"
    echo ""
    echo "1. Scan des premiers blocs :"
    echo "   nmap -Pn -p 51000-52000 $SERVER_IP"
    echo "   nmap -Pn -p 52000-53000 $SERVER_IP"
    echo "   nmap -Pn -p 53000-54000 $SERVER_IP"
    echo ""
    echo "2. Ou utilisez le script de scan par blocs :"
    echo "   ./block-scan.sh $SERVER_IP 51000 59100"
    echo ""
    echo "3. Vérifiez votre panneau de contrôle OVH"
    echo "4. Consultez l'email de création du VPS"
else
    print_message "✅ Ports SSH trouvés :"
    for port in "${found_ports[@]}"; do
        echo "  🟢 Port $port - SSH accessible"
    done
fi

print_message ""
print_message "💡 Conseils OVH :"
echo "  - OVH utilise souvent des ports dans cette plage"
echo "  - Le port SSH est affiché dans le panneau de contrôle"
echo "  - Consultez l'email de création du VPS"
echo "  - Le port est souvent dans les détails du serveur"
