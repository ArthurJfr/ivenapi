# 🚀 Déploiement et exécution des scripts sous Windows (via WSL)

Ce guide explique comment exécuter les scripts `.sh` de ce projet sous Windows en utilisant WSL (Windows Subsystem for Linux). C'est la méthode recommandée pour une compatibilité maximale (sshpass, ssh/scp, etc.).

## ✅ Prérequis

### 1) Installer WSL + Ubuntu
- Ouvrez PowerShell en administrateur et lancez:
  ```powershell
wsl --install
  ```
- Redémarrez le PC si demandé, puis lancez « Ubuntu » depuis le menu Démarrer et créez votre utilisateur Linux.

### 2) Préparer l'environnement dans WSL
```bash
sudo apt update && sudo apt install -y sshpass curl tar
# Optionnel (pour valider docker-compose localement via verify-deployment.sh)
sudo apt install -y docker-compose
```

### 3) Accéder au projet dans WSL
- Si votre projet est dans `C:\Users\jd\dev\projetfin3bci\ivenapi`, sous WSL le chemin devient:
  ```bash
cd /mnt/c/Users/jd/dev/projetfin3bci/ivenapi
chmod +x *.sh
  ```

## ▶️ Utilisation des scripts (identique aux autres OS)

- Vérifier la configuration avant déploiement (local):
  ```bash
./verify-deployment.sh
  ```

- Tester la connexion et la préparation serveur (mot de passe + port requis):
  ```bash
./test-deployment.sh <IP_SERVEUR> <SSH_USER> <SSH_PORT>
# Exemple
./test-deployment.sh 51.75.xx.yy ubuntu 55123
  ```

- Déploiement complet (installe Docker/Compose sur le serveur, configure UFW, transfère le projet, lance l'API):
  ```bash
./setup-server.sh <IP_SERVEUR> <SSH_USER> <SSH_PORT>
# Exemple
./setup-server.sh 51.75.xx.yy ubuntu 55123
  ```

- Déploiement simple (serveur déjà prêt; n'installe rien côté serveur):
  ```bash
./deploy-to-server.sh <IP_SERVEUR> <SSH_USER> <SSH_PORT>
  ```

## 🔐 Authentification SSH avec mot de passe
- Les scripts demandent votre mot de passe SSH une seule fois par exécution.
- `sshpass` s'occupe de passer le mot de passe aux commandes `ssh` et `scp`.
- Le port SSH personnalisé est obligatoire dans toutes les commandes (pas de valeur par défaut).

## ⚠️ Notes importantes
- Évitez d'exécuter ces scripts dans « Git Bash » Windows: `sshpass` y est instable. Préférez WSL.
- Vous n'avez pas besoin d'installer Docker sur Windows pour déployer. Le déploiement s'exécute à distance sur le serveur. Docker Desktop est optionnel et seulement utile si vous voulez valider localement `docker-compose config`.
- Les scripts affichent des commandes d'aide incluant `-p <SSH_PORT>` pour se reconnecter facilement au serveur.

## 🧪 Vérification rapide
```bash
# Depuis WSL, au niveau du dossier du projet
cd /mnt/c/Users/jd/dev/projetfin3bci/ivenapi
chmod +x *.sh
./verify-deployment.sh
```

## 🚀 Séquence recommandée
1. `./verify-deployment.sh`
2. `./test-deployment.sh <IP> <USER> <PORT>`
3. `./setup-server.sh <IP> <USER> <PORT>`
4. Sur le serveur ensuite:
   ```bash
   cd /opt/iven-api
   ./deploy.sh logs   # voir les logs
   ./deploy.sh restart
   ```

---

Besoin d'aide pour les variables `.env` ou la configuration MySQL/Nginx? Voir `README_DEPLOYMENT.md` et `DEPLOYMENT_CHECKLIST.md` dans le projet.
