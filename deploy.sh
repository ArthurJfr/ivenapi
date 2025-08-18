#!/bin/bash

# Copie du fichier .env.example vers .env
echo "Copie du fichier .env.example vers .env"
cp .env.example .env

#!/usr/bin/env bash
set -euo pipefail

# Déploiement simplifié pour VPS OVH
# Prérequis: docker et docker-compose installés sur le VPS

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"



echo "[1/4] Construction des images..."
docker compose build --no-cache

echo "[2/4] Démarrage des services en arrière-plan..."
docker compose up -d

echo "[3/4] Vérification des logs de l'API (100 dernières lignes)"
docker logs --tail 100 iven-api || true

echo "[4/4] Statut des conteneurs:"
docker compose ps

echo "Déploiement terminé. API accessible sur http://IP_DU_VPS:3000"

