#!/bin/bash

# Script pour scanner les ports SSH entre 50000 et 60000
# Usage: ./scan-high-ports.sh [SERVER_IP] [SSH_USER]

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

print_step "🔍 Scan des ports SSH entre 50000 et 60000 sur $SERVER_IP"

# Demander le mot de passe SSH
echo -n "Entrez le mot de passe SSH pour tester les connexions: "
read -s SSH_PASSWORD
echo ""

print_step "🔍 Test des ports SSH (50000-60000)..."

found_ports=()
tested_count=0
total_ports=10001  # 60000 - 50000 + 1

# Test par blocs pour optimiser
for ((port=50000; port<=60000; port+=10)); do
    tested_count=$((tested_count + 10))
    
    # Afficher le progrès tous les 1000 ports
    if [ $((port % 1000)) -eq 0 ]; then
        progress=$((tested_count * 100 / total_ports))
        echo -ne "\r🔍 Progression: $progress% ($tested_count/$total_ports ports testés)"
    fi
    
    # Test de connexion avec timeout
    if timeout 3 sshpass -p "$SSH_PASSWORD" ssh -p $port -o ConnectTimeout=2 -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP "echo 'OK'" 2>/dev/null; then
        echo ""
        echo -e "  ${GREEN}✅ Port $port - SSH accessible${NC}"
        found_ports+=($port)
    fi
done

echo ""
echo ""

if [ ${#found_ports[@]} -eq 0 ]; then
    print_error "❌ Aucun port SSH trouvé entre 50000 et 60000"
    print_message "Vérifiez :"
    echo "  - L'IP du serveur est correcte"
    echo "  - L'utilisateur SSH existe"
    echo "  - Le mot de passe est correct"
    echo "  - Le serveur est accessible"
    echo "  - Le service SSH est démarré"
    echo "  - La plage de ports est correcte"
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

print_message ""
print_message "🔧 Méthodes alternatives :"

echo "1. Scan avec nmap (plus rapide) :"
echo "   nmap -p 50000-60000 $SERVER_IP"

echo "2. Scan par blocs avec nmap :"
echo "   nmap -p 50000-51000 $SERVER_IP"
echo "   nmap -p 51000-52000 $SERVER_IP"
echo "   # etc..."

echo "3. Scan avec netcat :"
echo "   for port in {50000..60000}; do"
echo "     nc -zv $SERVER_IP \$port"
echo "   done"

print_message ""
print_message "💡 Optimisations :"
echo "  - Le scan peut prendre du temps (10001 ports)"
echo "  - Utilisez nmap pour un scan plus rapide"
echo "  - Vérifiez votre panneau de contrôle VPS"
echo "  - Consultez la documentation de votre fournisseur"
