#!/bin/bash

# Script pour trouver le port SSH ouvert sur un serveur
# Usage: ./find-ssh-port.sh [SERVER_IP] [SSH_USER]

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
    echo "Exemple: $0 192.168.1.100 ubuntu"
    exit 1
fi

SERVER_IP=$1
SSH_USER=$2

print_step "🔍 Recherche du port SSH ouvert sur $SERVER_IP"

# Ports SSH courants à tester
SSH_PORTS=(22 2222 222 2200 2201 2202 2203 2204 2205 2206 2207 2208 2209 2210)

print_message "📋 Ports SSH courants à tester :"
echo "  ${SSH_PORTS[*]}"

# Demander le mot de passe SSH
echo -n "Entrez le mot de passe SSH pour tester les connexions: "
read -s SSH_PASSWORD
echo ""

print_step "🔍 Test des ports SSH..."

found_ports=()

for port in "${SSH_PORTS[@]}"; do
    echo -n "  Test du port $port... "
    
    # Test de connexion avec timeout
    if timeout 5 sshpass -p "$SSH_PASSWORD" ssh -p $port -o ConnectTimeout=3 -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP "echo 'OK'" 2>/dev/null; then
        echo -e "${GREEN}✅ Ouvert${NC}"
        found_ports+=($port)
    else
        echo -e "${RED}❌ Fermé${NC}"
    fi
done

echo ""
if [ ${#found_ports[@]} -eq 0 ]; then
    print_error "❌ Aucun port SSH trouvé"
    print_message "Vérifiez :"
    echo "  - L'IP du serveur est correcte"
    echo "  - L'utilisateur SSH existe"
    echo "  - Le mot de passe est correct"
    echo "  - Le serveur est accessible"
    echo "  - Le service SSH est démarré"
else
    print_message "✅ Ports SSH trouvés :"
    for port in "${found_ports[@]}"; do
        echo "  🟢 Port $port - SSH accessible"
    done
    
    echo ""
    print_message "🚀 Test de connexion complète sur le premier port trouvé..."
    
    # Test complet sur le premier port trouvé
    first_port=${found_ports[0]}
    print_step "Test complet sur le port $first_port"
    
    if sshpass -p "$SSH_PASSWORD" ssh -p $first_port -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP << 'EOF'
        echo "✅ Connexion SSH réussie"
        echo "📋 Informations système :"
        echo "  - OS: $(lsb_release -d | cut -f2 2>/dev/null || echo 'Non détecté')"
        echo "  - Architecture: $(uname -m)"
        echo "  - Mémoire: $(free -h | grep Mem | awk '{print $2}' 2>/dev/null || echo 'Non détecté')"
        echo "  - Espace disque: $(df -h / | tail -1 | awk '{print $4}' 2>/dev/null || echo 'Non détecté')"
        echo "  - Docker: $(docker --version 2>/dev/null || echo 'Non installé')"
        echo "  - Docker Compose: $(docker-compose --version 2>/dev/null || echo 'Non installé')"
EOF
    then
        print_message "✅ Test complet réussi sur le port $first_port"
        echo ""
        print_message "📋 Commandes pour déployer :"
        echo "  ./test-deployment.sh $SERVER_IP $SSH_USER $first_port"
        echo "  ./setup-server.sh $SERVER_IP $SSH_USER $first_port"
    else
        print_error "❌ Test complet échoué sur le port $first_port"
    fi
fi

echo ""
print_message "🔧 Autres méthodes pour trouver le port SSH :"

echo "1. Via nmap (si installé) :"
echo "   nmap -p 22,2222,222,2200-2210 $SERVER_IP"

echo "2. Via telnet :"
echo "   telnet $SERVER_IP 22"
echo "   telnet $SERVER_IP 2222"

echo "3. Via netcat :"
echo "   nc -zv $SERVER_IP 22"
echo "   nc -zv $SERVER_IP 2222"

echo "4. Via votre fournisseur de VPS :"
echo "   - Consultez le panneau de contrôle"
echo "   - Vérifiez les règles de firewall"
echo "   - Consultez la documentation"
