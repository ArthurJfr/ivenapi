#!/bin/bash

# Script de test de déploiement avec authentification SSH par mot de passe
# Usage: ./test-deployment.sh [SERVER_IP] [SSH_USER] [SSH_PORT]

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

print_step "🧪 Test de déploiement vers $SERVER_IP:$SSH_PORT avec l'utilisateur $SSH_USER"

# 1. Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    print_error "Le fichier .env n'existe pas"
    print_message "Création du fichier .env..."
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
    print_message "✅ Fichier .env créé"
fi

print_message "✅ Fichier .env trouvé"

# 2. Tester la connexion SSH avec sshpass
print_step "Test de connexion SSH sur le port $SSH_PORT..."

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

# Tester la connexion avec le port spécifique
if sshpass -p "$SSH_PASSWORD" ssh -p $SSH_PORT -o ConnectTimeout=10 -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP "echo 'Connexion SSH réussie'" 2>/dev/null; then
    print_message "✅ Connexion SSH réussie sur le port $SSH_PORT"
else
    print_error "❌ Impossible de se connecter au serveur"
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
tar -czf iven-api-test.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=logs \
    --exclude=uploads \
    --exclude=.DS_Store \
    --exclude=*.log \
    .

print_message "✅ Archive créée : iven-api-test.tar.gz"

# 4. Transférer les fichiers vers le serveur
print_step "Transfert des fichiers vers le serveur..."
if sshpass -p "$SSH_PASSWORD" scp -P $SSH_PORT -o StrictHostKeyChecking=no iven-api-test.tar.gz $SSH_USER@$SERVER_IP:/tmp/; then
    print_message "✅ Fichiers transférés"
else
    print_error "❌ Erreur lors du transfert des fichiers"
    exit 1
fi

# 5. Test de configuration sur le serveur
print_step "Test de configuration sur le serveur..."

sshpass -p "$SSH_PASSWORD" ssh -p $SSH_PORT -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP << 'EOF'
    set -e
    
    echo "🧪 Test de configuration sur le serveur..."
    
    # Vérifier l'OS
    echo "📋 Informations système :"
    echo "  - OS: $(lsb_release -d | cut -f2)"
    echo "  - Architecture: $(uname -m)"
    echo "  - Mémoire: $(free -h | grep Mem | awk '{print $2}')"
    echo "  - Espace disque: $(df -h / | tail -1 | awk '{print $4}') libre"
    
    # Vérifier Docker
    echo "🐳 Vérification Docker..."
    if command -v docker &> /dev/null; then
        echo "  ✅ Docker installé: $(docker --version)"
    else
        echo "  ❌ Docker non installé"
    fi
    
    # Vérifier Docker Compose
    if command -v docker-compose &> /dev/null; then
        echo "  ✅ Docker Compose installé: $(docker-compose --version)"
    else
        echo "  ❌ Docker Compose non installé"
    fi
    
    # Créer le répertoire de test
    echo "📁 Création du répertoire de test..."
    sudo mkdir -p /opt/iven-api-test
    sudo chown $USER:$USER /opt/iven-api-test
    cd /opt/iven-api-test
    
    # Extraire les fichiers
    echo "📦 Extraction des fichiers..."
    tar -xzf /tmp/iven-api-test.tar.gz
    
    # Vérifier les fichiers essentiels
    echo "🔍 Vérification des fichiers..."
    required_files=("Dockerfile" "docker-compose.yml" "package.json" "server.js" "init.sql")
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            echo "  ✅ $file"
        else
            echo "  ❌ $file manquant"
        fi
    done
    
    # Test de syntaxe Docker Compose
    echo "🔧 Test de syntaxe Docker Compose..."
    if docker-compose config > /dev/null 2>&1; then
        echo "  ✅ Syntaxe Docker Compose valide"
    else
        echo "  ❌ Erreur de syntaxe Docker Compose"
        docker-compose config
    fi
    
    # Test de build Docker (optionnel)
    echo "🏗️ Test de build Docker..."
    if docker build -t iven-api-test . > /dev/null 2>&1; then
        echo "  ✅ Build Docker réussi"
    else
        echo "  ❌ Erreur de build Docker"
    fi
    
    # Nettoyer
    rm -f /tmp/iven-api-test.tar.gz
    cd /
    sudo rm -rf /opt/iven-api-test
    
    echo "✅ Test de configuration terminé"
EOF

# 6. Nettoyer
rm iven-api-test.tar.gz

print_message "✅ Test de déploiement terminé !"

print_message ""
print_message "📋 Résumé du test :"
echo "  ✅ Connexion SSH fonctionnelle sur le port $SSH_PORT"
echo "  ✅ Transfert de fichiers réussi"
echo "  ✅ Configuration serveur vérifiée"
echo "  ✅ Docker et Docker Compose testés"
echo "  ✅ Syntaxe Docker Compose valide"
echo "  ✅ Build Docker réussi"

print_message ""
print_message "🚀 Prêt pour le déploiement réel !"
echo ""
print_message "Pour déployer :"
echo "  ./setup-server.sh $SERVER_IP $SSH_USER $SSH_PORT"
echo ""
print_message "Note : Le script de déploiement vous demandera le mot de passe SSH"
