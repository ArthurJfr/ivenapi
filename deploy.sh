#!/bin/bash

# Copie du fichier .env.example vers .env
echo "Copie du fichier .env.example vers .env (si non existant)"
cp env.example .env

#!/usr/bin/env bash
set -euo pipefail

# Déploiement simplifié pour VPS OVH
# Prérequis: docker et docker-compose installés sur le VPS

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Vérifier si on doit ignorer les tests
SKIP_TESTS=false
if [[ "${1:-}" == "--skip-tests" ]]; then
    SKIP_TESTS=true
    echo "⚠️  Tests ignorés (--skip-tests)"
fi

# Tests dans un conteneur Docker (pas besoin de Node.js sur le VPS)
if [[ "$SKIP_TESTS" == "false" ]]; then
    echo "[1/5] Exécution des tests dans un conteneur Docker..."
    if docker run --rm -v "$(pwd)":/app -w /app -e NODE_ENV=test node:20-alpine sh -c "npm install && npm test"; then
        echo "✅ Tests passés avec succès"
    else
        echo "❌ Tests échoués. Déploiement annulé."
        echo "💡 Pour ignorer les tests, utilisez: ./deploy.sh --skip-tests"
        exit 1
    fi
else
    echo "[1/5] Tests ignorés"
fi

echo "[2/5] Construction des images..."
docker compose build --no-cache

echo "[3/5] Démarrage des services en arrière-plan..."
docker compose up -d

echo "[4/5] Vérification des logs de l'API (100 dernières lignes)"
docker logs --tail 100 iven-api || true

echo "[5/5] Statut des conteneurs:"
docker compose ps

echo "✅ Déploiement terminé. API accessible sur http://IP_DU_VPS:3000"

