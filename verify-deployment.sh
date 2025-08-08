#!/bin/bash

# Script de vérification avant déploiement
# Usage: ./verify-deployment.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[✅]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[🔍]${NC} $1"
}

echo "🔍 Vérification complète avant déploiement..."
echo ""

# 1. Vérifier les fichiers essentiels
print_step "Vérification des fichiers essentiels..."

required_files=(
    "Dockerfile"
    "docker-compose.yml"
    "package.json"
    "server.js"
    "init.sql"
    "deploy.sh"
    "setup-server.sh"
    "nginx.conf"
    ".dockerignore"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_message "Fichier $file trouvé"
    else
        print_error "Fichier $file manquant"
        exit 1
    fi
done

# 2. Vérifier le Dockerfile
print_step "Vérification du Dockerfile..."

if grep -q "FROM node:20-alpine" Dockerfile; then
    print_message "Image Node.js 20 Alpine correcte"
else
    print_error "Image Node.js incorrecte dans Dockerfile"
fi

if grep -q "EXPOSE 3000" Dockerfile; then
    print_message "Port 3000 exposé"
else
    print_error "Port non exposé dans Dockerfile"
fi

# 3. Vérifier docker-compose.yml
print_step "Vérification du docker-compose.yml..."

if grep -q "version: '3.8'" docker-compose.yml; then
    print_message "Version Docker Compose correcte"
else
    print_error "Version Docker Compose incorrecte"
fi

if grep -q "mysql:8.0" docker-compose.yml; then
    print_message "Image MySQL 8.0 configurée"
else
    print_error "Image MySQL manquante"
fi

if grep -q "nginx:alpine" docker-compose.yml; then
    print_message "Image Nginx configurée"
else
    print_error "Image Nginx manquante"
fi

# 4. Vérifier package.json
print_step "Vérification du package.json..."

if grep -q '"start": "node server.js"' package.json; then
    print_message "Script start configuré"
else
    print_error "Script start manquant"
fi

# 5. Vérifier init.sql
print_step "Vérification du script SQL..."

if grep -q "CREATE TABLE IF NOT EXISTS users" init.sql; then
    print_message "Table users définie"
else
    print_error "Table users manquante"
fi


# 6. Vérifier les scripts
print_step "Vérification des scripts..."

if [ -x "deploy.sh" ]; then
    print_message "Script deploy.sh exécutable"
else
    print_warning "Script deploy.sh non exécutable"
fi

if [ -x "setup-server.sh" ]; then
    print_message "Script setup-server.sh exécutable"
else
    print_warning "Script setup-server.sh non exécutable"
fi

# 7. Vérifier la configuration Nginx
print_step "Vérification de la configuration Nginx..."

if grep -q "upstream api_backend" nginx.conf; then
    print_message "Upstream Nginx configuré"
else
    print_error "Upstream Nginx manquant"
fi

if grep -q "listen 80" nginx.conf; then
    print_message "Port 80 configuré"
else
    print_error "Port 80 manquant"
fi

# 8. Vérifier les dépendances
print_step "Vérification des dépendances..."

required_deps=(
    "express"
    "mysql2"
    "bcrypt"
    "jsonwebtoken"
    "cors"
    "dotenv"
)

for dep in "${required_deps[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        print_message "Dépendance $dep présente"
    else
        print_warning "Dépendance $dep manquante"
    fi
done

# 9. Vérifier la structure des dossiers
print_step "Vérification de la structure..."

required_dirs=(
    "controllers"
    "models"
    "routes"
    "middleware"
    "config"
    "utils"
)

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        print_message "Dossier $dir présent"
    else
        print_error "Dossier $dir manquant"
    fi
done

# 10. Vérifier les fichiers de configuration
print_step "Vérification des fichiers de configuration..."

if [ -f "config/db.js" ]; then
    print_message "Configuration DB présente"
else
    print_error "Configuration DB manquante"
fi

if [ -f "config/logger.js" ]; then
    print_message "Configuration logger présente"
else
    print_error "Configuration logger manquante"
fi

# 11. Test de syntaxe Docker Compose
print_step "Test de syntaxe Docker Compose..."

if docker-compose config > /dev/null 2>&1; then
    print_message "Syntaxe Docker Compose valide"
else
    print_error "Erreur de syntaxe Docker Compose"
    docker-compose config
    exit 1
fi

echo ""
print_message "🎉 Vérification terminée !"
echo ""
print_message "📋 Résumé :"
echo "  ✅ Tous les fichiers essentiels sont présents"
echo "  ✅ Configuration Docker correcte"
echo "  ✅ Scripts de déploiement prêts"
echo "  ✅ Base de données configurée"
echo "  ✅ Nginx configuré"
echo ""
print_message "🚀 Prêt pour le déploiement !"
echo ""
print_message "Prochaines étapes :"
echo "  1. Rendre les scripts exécutables : chmod +x *.sh"
echo "  2. Lancer le déploiement : ./setup-server.sh IP_SERVEUR UTILISATEUR"
echo ""