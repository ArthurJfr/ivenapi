#!/bin/bash

# Script de déploiement vers le serveur
# Usage: ./deploy-to-server.sh [SERVER_IP] [SSH_USER]

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
REMOTE_DIR="/opt/iven-api"

print_step "🚀 Déploiement vers $SERVER_IP avec l'utilisateur $SSH_USER"

# 1. Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    print_error "Le fichier .env n'existe pas"
    print_message "Création du fichier .env basé sur env.example..."
    cp env.example .env
    print_warning "Veuillez éditer le fichier .env avec vos vraies valeurs avant de continuer"
    print_message "Commandes pour éditer :"
    echo "  nano .env"
    echo "  # ou"
    echo "  code .env"
    exit 1
fi

print_message "✅ Fichier .env trouvé"

# 2. Tester la connexion SSH
print_step "Test de connexion SSH..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $SSH_USER@$SERVER_IP exit 2>/dev/null; then
    print_error "Impossible de se connecter au serveur"
    print_message "Vérifiez :"
    echo "  - L'IP du serveur est correcte"
    echo "  - L'utilisateur SSH existe"
    echo "  - Votre clé SSH est configurée"
    echo "  - Le serveur est accessible"
    exit 1
fi

print_message "✅ Connexion SSH réussie"

# 3. Préparer les fichiers pour le serveur
print_step "Préparation des fichiers..."

# Créer un tar.gz avec les fichiers nécessaires
tar -czf iven-api-deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=logs \
    --exclude=uploads \
    --exclude=.DS_Store \
    --exclude=*.log \
    .

print_message "✅ Archive créée : iven-api-deploy.tar.gz"

# 4. Transférer les fichiers vers le serveur
print_step "Transfert des fichiers vers le serveur..."
scp iven-api-deploy.tar.gz $SSH_USER@$SERVER_IP:/tmp/

print_message "✅ Fichiers transférés"

# 5. Exécuter le déploiement sur le serveur
print_step "Déploiement sur le serveur..."

ssh $SSH_USER@$SERVER_IP << 'EOF'
    set -e
    
    echo "🔧 Installation sur le serveur..."
    
    # Créer le répertoire de déploiement
    sudo mkdir -p /opt/iven-api
    sudo chown $USER:$USER /opt/iven-api
    cd /opt/iven-api
    
    # Extraire les fichiers
    tar -xzf /tmp/iven-api-deploy.tar.gz
    
    # Installer Docker si pas déjà fait
    if ! command -v docker &> /dev/null; then
        echo "📦 Installation de Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        echo "✅ Docker installé"
    fi
    
    # Installer Docker Compose si pas déjà fait
    if ! command -v docker-compose &> /dev/null; then
        echo "📦 Installation de Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        echo "✅ Docker Compose installé"
    fi
    
    # Rendre le script de déploiement exécutable
    chmod +x deploy.sh
    
    # Démarrer les services
    echo "🚀 Démarrage des services..."
    ./deploy.sh start
    
    echo "✅ Déploiement terminé !"
    echo ""
    echo "📊 Informations :"
    echo "  - API accessible sur : http://$SERVER_IP:3000"
    echo "  - Logs : ./deploy.sh logs"
    echo "  - Arrêter : ./deploy.sh stop"
    echo "  - Redémarrer : ./deploy.sh restart"
EOF

# 6. Nettoyer
rm iven-api-deploy.tar.gz

print_message "✅ Déploiement terminé !"

# 7. Test de connexion
print_step "Test de l'API..."
sleep 10

if curl -f http://$SERVER_IP:3000/api/health > /dev/null 2>&1; then
    print_message "🎉 API accessible sur http://$SERVER_IP:3000"
else
    print_warning "L'API n'est pas encore accessible"
    print_message "Vérifiez les logs avec : ssh $SSH_USER@$SERVER_IP 'cd /opt/iven-api && ./deploy.sh logs'"
fi

print_message ""
print_message "📋 Commandes utiles :"
echo "  - Voir les logs : ssh $SSH_USER@$SERVER_IP 'cd /opt/iven-api && ./deploy.sh logs'"
echo "  - Redémarrer : ssh $SSH_USER@$SERVER_IP 'cd /opt/iven-api && ./deploy.sh restart'"
echo "  - Arrêter : ssh $SSH_USER@$SERVER_IP 'cd /opt/iven-api && ./deploy.sh stop'"
echo "  - Accéder au serveur : ssh $SSH_USER@$SERVER_IP"
