# 🚀 Guide de Déploiement - API Iven sur VPS

Ce guide vous explique comment déployer votre API Iven sur un VPS avec Docker.

## 📋 Prérequis

### Sur votre VPS, assurez-vous d'avoir :
- Ubuntu 20.04+ ou Debian 11+
- Docker installé
- Docker Compose installé
- Un domaine configuré (optionnel mais recommandé)

## 🔧 Installation sur le VPS

### 1. Installation de Docker et Docker Compose

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Redémarrer la session ou exécuter
newgrp docker
```

### 2. Cloner votre projet

```bash
# Créer un dossier pour votre projet
mkdir -p /opt/iven-api
cd /opt/iven-api

# Cloner votre repository (remplacez par votre URL)
git clone https://github.com/votre-username/iven-api.git .
```

### 3. Configuration des variables d'environnement

```bash
# Créer le fichier .env
cp .env.example .env
nano .env
```

**Contenu du fichier `.env` :**

```env
# Configuration de la base de données
DB_HOST=db
DB_USER=iven_user
DB_PASSWORD=votre_mot_de_passe_securise
DB_NAME=iven_db
DB_ROOT_PASSWORD=votre_mot_de_passe_root_securise

# Configuration JWT
JWT_SECRET=votre_cle_secrete_jwt_tres_longue_et_complexe

# Configuration MongoDB
MONGO_URI=mongodb://localhost:27017/iven

# Configuration Email (Gmail exemple)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application

# Configuration du serveur
PORT=3000
NODE_ENV=production
```

### 4. Configuration du firewall

```bash
# Installer UFW si pas déjà fait
sudo apt install ufw

# Configurer le firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000  # Optionnel, pour accès direct à l'API
sudo ufw enable
```

## 🚀 Déploiement

### Option 1 : Utiliser le script de déploiement

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Démarrer les services
./deploy.sh start

# Vérifier les logs
./deploy.sh logs

# Arrêter les services
./deploy.sh stop
```

### Option 2 : Utiliser Docker Compose directement

```bash
# Construire et démarrer les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

## 🔍 Vérification du déploiement

### 1. Vérifier que les conteneurs sont en cours d'exécution

```bash
docker-compose ps
```

Vous devriez voir :
- `iven-api` (statut: Up)
- `iven-mysql` (statut: Up)
- `iven-nginx` (statut: Up)

### 2. Tester l'API

```bash
# Test de santé
curl http://votre-ip:3000/api/health

# Test de l'endpoint racine
curl http://votre-ip:3000/
```

### 3. Vérifier les logs

```bash
# Logs de l'API
docker-compose logs api

# Logs de la base de données
docker-compose logs db

# Logs de Nginx
docker-compose logs nginx
```

## 🌐 Configuration du domaine (optionnel)

### 1. Configurer votre domaine

Pointez votre domaine vers l'IP de votre VPS :
```
A    votre-domaine.com    ->    IP_DE_VOTRE_VPS
A    www.votre-domaine.com    ->    IP_DE_VOTRE_VPS
```

### 2. Modifier la configuration Nginx

Éditez `nginx.conf` et remplacez `your-domain.com` par votre vrai domaine.

### 3. Configuration SSL avec Let's Encrypt (recommandé)

```bash
# Installer Certbot
sudo apt install certbot

# Obtenir un certificat SSL
sudo certbot certonly --standalone -d votre-domaine.com -d www.votre-domaine.com

# Copier les certificats
sudo mkdir -p /opt/iven-api/ssl
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem /opt/iven-api/ssl/cert.pem
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem /opt/iven-api/ssl/key.pem
sudo chown -R $USER:$USER /opt/iven-api/ssl

# Décommenter la section HTTPS dans nginx.conf
# Redémarrer les services
./deploy.sh restart
```

## 🔧 Maintenance

### Mise à jour de l'application

```bash
# Arrêter les services
./deploy.sh stop

# Récupérer les dernières modifications
git pull origin main

# Reconstruire et redémarrer
./deploy.sh build
./deploy.sh start
```

### Sauvegarde de la base de données

```bash
# Créer un script de sauvegarde
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db mysqldump -u root -p$DB_ROOT_PASSWORD iven_db > backup_$DATE.sql
gzip backup_$DATE.sql
echo "Sauvegarde créée: backup_$DATE.sql.gz"
EOF

chmod +x backup.sh
./backup.sh
```

### Restauration de la base de données

```bash
# Restaurer une sauvegarde
gunzip -c backup_20240101_120000.sql.gz | docker-compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD iven_db
```

## 📊 Monitoring

### Vérifier l'utilisation des ressources

```bash
# Utilisation des conteneurs
docker stats

# Espace disque
df -h

# Utilisation mémoire
free -h
```

### Logs et debugging

```bash
# Logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f api

# Accéder au conteneur
docker-compose exec api sh
```

## 🛠️ Dépannage

### Problèmes courants

1. **L'API ne démarre pas**
   ```bash
   # Vérifier les logs
   docker-compose logs api
   
   # Vérifier la configuration
   docker-compose config
   ```

2. **Problème de connexion à la base de données**
   ```bash
   # Vérifier que MySQL démarre
   docker-compose logs db
   
   # Tester la connexion
   docker-compose exec db mysql -u root -p
   ```

3. **Problème de permissions**
   ```bash
   # Corriger les permissions
   sudo chown -R $USER:$USER /opt/iven-api
   ```

### Commandes utiles

```bash
# Redémarrer un service spécifique
docker-compose restart api

# Reconstruire un service
docker-compose build api

# Nettoyer les volumes
docker-compose down -v

# Supprimer les images non utilisées
docker system prune -a
```

## 🔒 Sécurité

### Recommandations

1. **Changer les mots de passe par défaut**
2. **Utiliser des clés JWT complexes**
3. **Configurer un firewall**
4. **Mettre à jour régulièrement**
5. **Configurer des sauvegardes automatiques**
6. **Utiliser HTTPS en production**

### Variables d'environnement sensibles

Assurez-vous que votre fichier `.env` contient des valeurs sécurisées :
- `DB_PASSWORD` : Mot de passe complexe pour MySQL
- `JWT_SECRET` : Clé secrète très longue et complexe
- `EMAIL_PASS` : Mot de passe d'application pour Gmail

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `./deploy.sh logs`
2. Consultez la documentation Docker
3. Vérifiez la configuration de votre VPS

---

**🎉 Votre API Iven est maintenant déployée sur votre VPS !**
