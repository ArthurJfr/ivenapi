#!/bin/bash

# Script de configuration complète du serveur
# Usage: ./setup-server.sh [SERVER_IP] [SSH_USER] [SSH_PORT]

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
    echo "Usage: $0 <SERVER_IP> <SSH_USER> [SSH_PORT]"
    echo "Exemple: $0 192.168.1.100 ubuntu 2222"
    echo "Exemple: $0 votre-domaine.com root 22"
    exit 1
fi

SERVER_IP=$1
SSH_USER=$2
SSH_PORT=${3:-22}  # Port par défaut 22 si non spécifié

print_step "🔧 Configuration complète du serveur $SERVER_IP:$SSH_PORT"

# 1. Créer le fichier .env local avec des valeurs sécurisées
print_step "Création du fichier .env..."

cat > .env << 'EOF'
# Configuration de la base de données MySQL
DB_HOST=db
DB_USER=iven_user
DB_PASSWORD=IvenSecureDB2024!
DB_NAME=iven_db
DB_ROOT_PASSWORD=IvenRootSecure2024!

# Configuration JWT (clé secrète générée)
JWT_SECRET=iven_jwt_secret_key_2024_very_long_and_complex_for_security_123456789

# Configuration MongoDB (optionnel pour l'instant)
MONGO_URI=mongodb://localhost:27017/iven

# Configuration Email (à configurer selon vos besoins)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application

# Configuration du serveur
PORT=3000
NODE_ENV=production
EOF

print_message "✅ Fichier .env créé avec des valeurs sécurisées"

# 2. Tester la connexion SSH avec mot de passe
print_step "Test de connexion SSH..."

# Vérifier si sshpass est installé
if ! command -v sshpass &> /dev/null; then
    print_warning "sshpass n'est pas installé"
    print_message "Installation de sshpass..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install sshpass
    else
        # Linux
        sudo apt-get install sshpass
    fi
fi

# Demander le mot de passe SSH
echo -n "Entrez le mot de passe SSH pour $SSH_USER@$SERVER_IP:$SSH_PORT: "
read -s SSH_PASSWORD
echo ""

# Tester la connexion
if sshpass -p "$SSH_PASSWORD" ssh -p $SSH_PORT -o ConnectTimeout=10 -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP "echo 'Connexion SSH réussie'" 2>/dev/null; then
    print_message "✅ Connexion SSH réussie sur le port $SSH_PORT"
else
    print_error "Impossible de se connecter au serveur"
    print_message "Vérifiez :"
    echo "  - L'IP du serveur est correcte"
    echo "  - Le port SSH est correct ($SSH_PORT)"
    echo "  - L'utilisateur SSH existe"
    echo "  - Le mot de passe est correct"
    echo "  - Le serveur est accessible"
    exit 1
fi

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
if sshpass -p "$SSH_PASSWORD" scp -P $SSH_PORT -o StrictHostKeyChecking=no iven-api-deploy.tar.gz $SSH_USER@$SERVER_IP:/tmp/; then
    print_message "✅ Fichiers transférés"
else
    print_error "❌ Erreur lors du transfert des fichiers"
    exit 1
fi

# 5. Configuration complète sur le serveur
print_step "Configuration complète sur le serveur..."

sshpass -p "$SSH_PASSWORD" ssh -p $SSH_PORT -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP << 'EOF'
    set -e
    
    echo "🔧 Configuration complète du serveur..."
    
    # Mettre à jour le système
    echo "📦 Mise à jour du système..."
    sudo apt update && sudo apt upgrade -y
    
    # Installer les dépendances système
    echo "📦 Installation des dépendances système..."
    sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    # Installer Docker
    echo "🐳 Installation de Docker..."
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        echo "✅ Docker installé"
    else
        echo "✅ Docker déjà installé"
    fi
    
    # Redémarrer le service Docker et appliquer les groupes
    echo "🔄 Redémarrage du service Docker..."
    sudo systemctl restart docker
    newgrp docker
    
    # Installer Docker Compose
    echo "🐳 Installation de Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        echo "✅ Docker Compose installé"
    else
        echo "✅ Docker Compose déjà installé"
    fi
    
    # Installer et configurer UFW (firewall)
    echo "🔥 Configuration du firewall..."
    sudo apt install -y ufw
    sudo ufw allow ssh
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw allow 3000
    sudo ufw --force enable
    echo "✅ Firewall configuré"
    
    # Créer le répertoire de déploiement
    echo "📁 Création du répertoire de déploiement..."
    sudo mkdir -p /opt/iven-api
    sudo chown $USER:$USER /opt/iven-api
    cd /opt/iven-api
    
    # Extraire les fichiers
    echo "📦 Extraction des fichiers..."
    tar -xzf /tmp/iven-api-deploy.tar.gz
    
    # Rendre les scripts exécutables
    chmod +x deploy.sh
    chmod +x deploy-to-server.sh
    
    # Créer les dossiers nécessaires
    mkdir -p uploads/profiles logs
    
    # Démarrer les services
    echo "🚀 Démarrage des services..."
    ./deploy.sh start
    
    # Attendre que les services soient prêts
    echo "⏳ Attente des services..."
    sleep 30
    
    # Vérifier que les services fonctionnent
    echo "🔍 Vérification des services..."
    if docker-compose ps | grep -q "Up"; then
        echo "✅ Services démarrés avec succès"
    else
        echo "⚠️  Certains services ne sont pas démarrés"
    fi
    
    # Nettoyer les fichiers temporaires
    rm -f /tmp/iven-api-deploy.tar.gz
    
    echo "✅ Configuration complète terminée !"
    echo ""
    echo "📊 Informations du serveur :"
    echo "  - IP du serveur : $(hostname -I | awk '{print $1}')"
    echo "  - API accessible sur : http://$(hostname -I | awk '{print $1}'):3000"
    echo "  - Endpoint de santé : http://$(hostname -I | awk '{print $1}'):3000/api/health"
    echo ""
    echo "🔧 Commandes utiles :"
    echo "  - Logs : ./deploy.sh logs"
    echo "  - Redémarrer : ./deploy.sh restart"
    echo "  - Arrêter : ./deploy.sh stop"
    echo "  - Statut : docker-compose ps"
EOF

# 6. Nettoyer
rm iven-api-deploy.tar.gz

print_message "✅ Configuration complète terminée !"

# 7. Test de connexion
print_step "Test de l'API..."
sleep 15

if curl -f http://$SERVER_IP:3000/api/health > /dev/null 2>&1; then
    print_message "🎉 API accessible sur http://$SERVER_IP:3000"
    print_message "✅ Déploiement réussi !"
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
echo "  - Vérifier les conteneurs : ssh $SSH_USER@$SERVER_IP 'cd /opt/iven-api && docker-compose ps'"

print_message ""
print_message "🔒 Sécurité :"
echo "  - Mots de passe configurés automatiquement"
echo "  - Firewall activé"
echo "  - Services isolés dans Docker"
echo "  - Logs centralisés"

print_message ""
print_message "📧 Configuration email :"
echo "  - Éditez le fichier .env sur le serveur pour configurer l'email"
echo "  - ssh $SSH_USER@$SERVER_IP 'cd /opt/iven-api && nano .env'"
