# 🚀 Déploiement Rapide - API Iven

## 📋 Prérequis

- Serveur Ubuntu/Debian avec accès SSH
- Clé SSH configurée sur votre Mac
- IP et utilisateur SSH de votre serveur

## ⚡ Déploiement en 3 étapes

### 1. Préparation sur votre Mac

```bash
# Rendre les scripts exécutables
chmod +x setup-server.sh
chmod +x deploy-to-server.sh
chmod +x deploy.sh
```

### 2. Configuration automatique complète

```bash
# Déployer et configurer tout automatiquement
./setup-server.sh VOTRE_IP_SERVEUR VOTRE_UTILISATEUR_SSH

# Exemples :
./setup-server.sh 192.168.1.100 ubuntu
./setup-server.sh votre-domaine.com root
```

### 3. Vérification

```bash
# Tester l'API
curl http://VOTRE_IP_SERVEUR:3000/api/health

# Voir les logs
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && ./deploy.sh logs'
```

## 🔧 Ce que fait le script automatiquement

✅ **Installation système :**
- Mise à jour du système
- Installation de Docker et Docker Compose
- Configuration du firewall (UFW)

✅ **Configuration de la base de données :**
- MySQL 8.0 avec Docker
- Base de données `iven_db`
- Utilisateur `iven_user` avec mot de passe sécurisé
- Table `users` avec tous les champs nécessaires

✅ **Configuration de l'API :**
- Variables d'environnement sécurisées
- JWT secret généré automatiquement
- Ports configurés (3000, 80, 443)

✅ **Sécurité :**
- Firewall activé
- Services isolés dans Docker
- Mots de passe sécurisés

## 🌐 Accès à votre API

Une fois déployée :
- **API directe** : `http://VOTRE_IP:3000`
- **Endpoint de santé** : `http://VOTRE_IP:3000/api/health`
- **Documentation** : `http://VOTRE_IP:3000/`

## 📧 Configuration Email (optionnel)

Après le déploiement, configurez l'email :

```bash
# Éditer la configuration email
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && nano .env'
```

Modifiez ces lignes dans le fichier `.env` :
```env
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application_gmail
```

## 🛠️ Commandes utiles

```bash
# Voir les logs
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && ./deploy.sh logs'

# Redémarrer l'API
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && ./deploy.sh restart'

# Arrêter l'API
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && ./deploy.sh stop'

# Vérifier les conteneurs
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && docker-compose ps'

# Accéder au serveur
ssh VOTRE_UTILISATEUR@VOTRE_IP
```

## 🔒 Informations de sécurité

**Mots de passe configurés automatiquement :**
- Base de données : `IvenSecureDB2024!`
- Root MySQL : `IvenRootSecure2024!`
- JWT Secret : `iven_jwt_secret_key_2024_very_long_and_complex_for_security_123456789`

**⚠️ Recommandations :**
1. Changez les mots de passe après le premier déploiement
2. Configurez un domaine et SSL
3. Configurez l'email pour les notifications
4. Faites des sauvegardes régulières

## 🚨 En cas de problème

```bash
# Vérifier les logs
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && ./deploy.sh logs'

# Reconstruire les images
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && ./deploy.sh build'

# Nettoyer et redéployer
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && ./deploy.sh cleanup && ./deploy.sh start'
```

---

**🎉 Votre API sera accessible en quelques minutes !**
