# ✅ Checklist de Vérification - Déploiement API Iven

## 🔍 Vérifications Automatiques

Exécutez le script de vérification :
```bash
chmod +x verify-deployment.sh
./verify-deployment.sh
```

## 📋 Checklist Manuelle

### ✅ **Fichiers de Configuration**

- [ ] `Dockerfile` - Image Node.js 20 Alpine avec sécurité
- [ ] `docker-compose.yml` - Services API, MySQL, Nginx
- [ ] `init.sql` - Table users avec tous les champs + index
- [ ] `nginx.conf` - Reverse proxy configuré
- [ ] `package.json` - Dépendances complètes
- [ ] `server.js` - Point d'entrée de l'API

### ✅ **Scripts de Déploiement**

- [ ] `setup-server.sh` - Installation complète automatique
- [ ] `deploy.sh` - Gestion des services Docker
- [ ] `deploy-to-server.sh` - Déploiement depuis Mac
- [ ] `verify-deployment.sh` - Vérification avant déploiement

### ✅ **Configuration Sécurité**

- [ ] Utilisateur non-root dans Dockerfile
- [ ] Firewall UFW configuré
- [ ] Mots de passe sécurisés dans .env
- [ ] JWT secret complexe
- [ ] Ports limités (3000, 80, 443)

### ✅ **Base de Données**

- [ ] MySQL 8.0 avec Docker
- [ ] Table `users` complète avec tous les champs
- [ ] Index optimisés pour les performances
- [ ] Authentification native MySQL
- [ ] Volumes persistants

### ✅ **Services**

- [ ] API Node.js sur port 3000
- [ ] MySQL sur port 3306 (interne)
- [ ] Nginx sur ports 80/443
- [ ] Réseau Docker isolé
- [ ] Volumes pour uploads et logs

## 🚀 Déploiement

### **Étape 1 : Préparation**
```bash
# Rendre les scripts exécutables
chmod +x *.sh

# Vérifier la configuration
./verify-deployment.sh
```

### **Étape 2 : Déploiement**
```bash
# Déployer automatiquement
./setup-server.sh VOTRE_IP_SERVEUR VOTRE_UTILISATEUR_SSH
```

### **Étape 3 : Vérification**
```bash
# Tester l'API
curl http://VOTRE_IP_SERVEUR:3000/api/health

# Vérifier les logs
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && ./deploy.sh logs'
```

## 🔧 Configuration Post-Déploiement

### **Email (Optionnel)**
```bash
# Éditer la configuration email
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && nano .env'
```

Modifier :
```env
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application_gmail
```

### **Domaine et SSL (Recommandé)**
1. Pointer votre domaine vers l'IP du serveur
2. Modifier `nginx.conf` avec votre domaine
3. Configurer SSL avec Let's Encrypt

## 📊 Informations de Déploiement

### **Accès API**
- **Direct** : `http://VOTRE_IP:3000`
- **Via Nginx** : `http://VOTRE_IP`
- **Santé** : `http://VOTRE_IP:3000/api/health`

### **Base de Données**
- **Host** : `db` (dans Docker)
- **Base** : `iven_db`
- **Utilisateur** : `iven_user`
- **Mot de passe** : `IvenSecureDB2024!`

### **Commandes Utiles**
```bash
# Logs
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && ./deploy.sh logs'

# Redémarrer
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && ./deploy.sh restart'

# Statut
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && docker-compose ps'
```

## 🔒 Sécurité

### **Mots de Passe Configurés**
- **DB User** : `IvenSecureDB2024!`
- **DB Root** : `IvenRootSecure2024!`
- **JWT Secret** : `iven_jwt_secret_key_2024_very_long_and_complex_for_security_123456789`

### **Recommandations**
1. ✅ Changer les mots de passe après premier déploiement
2. ✅ Configurer un domaine et SSL
3. ✅ Configurer l'email pour les notifications
4. ✅ Faire des sauvegardes régulières
5. ✅ Monitorer les logs

## 🚨 Dépannage

### **Problèmes Courants**
1. **API ne démarre pas** → Vérifier les logs : `./deploy.sh logs`
2. **Base de données inaccessible** → Vérifier MySQL : `docker-compose logs db`
3. **Permissions** → Corriger : `sudo chown -R $USER:$USER /opt/iven-api`

### **Commandes de Debug**
```bash
# Logs détaillés
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && docker-compose logs -f'

# Reconstruire
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && ./deploy.sh build'

# Nettoyer et redéployer
ssh VOTRE_UTILISATEUR@VOTRE_IP 'cd /opt/iven-api && ./deploy.sh cleanup && ./deploy.sh start'
```

---

**🎉 Tout est prêt pour le déploiement !**
