#!/bin/bash

# Script de déploiement pour l'API Iven
# Usage: ./deploy.sh [start|stop|restart|logs|build]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Docker et Docker Compose sont installés
check_dependencies() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    print_message "Docker et Docker Compose sont installés"
}

# Vérifier que le fichier .env existe
check_env_file() {
    if [ ! -f .env ]; then
        print_error "Le fichier .env n'existe pas"
        print_message "Création d'un fichier .env.example..."
        cat > .env.example << EOF
# Configuration de la base de données
DB_HOST=db
DB_USER=iven_user
DB_PASSWORD=your_secure_password
DB_NAME=iven_db
DB_ROOT_PASSWORD=your_root_password

# Configuration JWT
JWT_SECRET=your_jwt_secret_key_here

# Configuration MongoDB
MONGO_URI=mongodb://localhost:27017/iven

# Configuration Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Configuration du serveur
PORT=3000
NODE_ENV=production
EOF
        print_warning "Veuillez créer un fichier .env basé sur .env.example"
        exit 1
    fi
    
    print_message "Fichier .env trouvé"
}

# Fonction pour démarrer les services
start_services() {
    print_message "Démarrage des services..."
    docker-compose up -d
    print_message "Services démarrés avec succès"
    
    # Attendre que la base de données soit prête
    print_message "Attente de la base de données..."
    sleep 30
    
    # Vérifier la santé de l'API
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_message "API accessible sur http://localhost:3000"
    else
        print_warning "L'API n'est pas encore accessible, vérifiez les logs"
    fi
}

# Fonction pour arrêter les services
stop_services() {
    print_message "Arrêt des services..."
    docker-compose down
    print_message "Services arrêtés"
}

# Fonction pour redémarrer les services
restart_services() {
    print_message "Redémarrage des services..."
    docker-compose down
    docker-compose up -d
    print_message "Services redémarrés"
}

# Fonction pour afficher les logs
show_logs() {
    print_message "Affichage des logs..."
    docker-compose logs -f
}

# Fonction pour reconstruire les images
build_images() {
    print_message "Reconstruction des images Docker..."
    docker-compose build --no-cache
    print_message "Images reconstruites"
}

# Fonction pour nettoyer
cleanup() {
    print_message "Nettoyage des conteneurs et volumes..."
    docker-compose down -v
    docker system prune -f
    print_message "Nettoyage terminé"
}

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [COMMANDE]"
    echo ""
    echo "Commandes disponibles:"
    echo "  start     - Démarrer les services"
    echo "  stop      - Arrêter les services"
    echo "  restart   - Redémarrer les services"
    echo "  logs      - Afficher les logs"
    echo "  build     - Reconstruire les images"
    echo "  cleanup   - Nettoyer les conteneurs et volumes"
    echo "  help      - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 start"
    echo "  $0 logs"
    echo "  $0 restart"
}

# Script principal
main() {
    check_dependencies
    check_env_file
    
    case "${1:-help}" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            show_logs
            ;;
        build)
            build_images
            ;;
        cleanup)
            cleanup
            ;;
        help|*)
            show_help
            ;;
    esac
}

# Exécuter le script principal
main "$@"
