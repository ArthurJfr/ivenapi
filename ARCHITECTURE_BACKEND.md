# 🏗️ Architecture Backend Express - IVEN

## 🎯 **Vue d'ensemble**

Le backend du projet IVEN repose sur **Express.js** et implémente une architecture hybride, combinant les forces de MySQL (relationnel), MongoDB (NoSQL temps réel), et Redis (cache et présence). Cette architecture vise la robustesse, la performance et la flexibilité pour supporter des fonctionnalités avancées (chat, gestion d'événements, médias, notifications, etc.).

---

## 📦 **Structure des Dossiers**

- `controllers/` : Logique métier (authentification, utilisateurs, santé, etc.)
- `models/` : Modèles de données (ex : User.js pour MySQL)
- `routes/` : Définition des routes API REST
- `middleware/` : Middlewares Express (auth, admin, logger, etc.)
- `config/` : Fichiers de configuration (DB, email, logger)
- `utils/` : Utilitaires (email, sécurité, gestion de fichiers)
- `uploads/` : Stockage des fichiers uploadés (ex : profils)
- `events/` : (potentiellement pour la logique temps réel ou gestion d'événements)
- `server.js` : Point d'entrée principal du serveur Express

---

## 🗄️ **Bases de Données**

### **1. MySQL (Relationnel)**
- **Utilisateurs** : Authentification, profils, gestion des accès
- **Événements** : Organisation, participants, tâches, dépenses, invitations
- **Transactions ACID** pour garantir l'intégrité des données critiques

### **2. MongoDB (NoSQL)**
- **Chat** : Messages, réactions, statuts de lecture (performance temps réel)
- **Médias** : Fichiers, albums, métadonnées complexes (EXIF, commentaires)
- **Notifications** : Logs, alertes, flexibilité de schéma
- **Dénormalisation contrôlée** pour éviter les jointures coûteuses

### **3. Redis (Cache & Présence)**
- **Sessions** : Stockage rapide des sessions utilisateur
- **Présence** : Statut en ligne, frappe en cours (typing)
- **Cache** : Accélération des lectures fréquentes

---

## 🔗 **Synchronisation & Flux de Données**

- **Écriture** : MySQL (source de vérité) → MongoDB (dénormalisation pour le chat/médias)
- **Lecture** : MongoDB (performance) + MySQL (cohérence)
- **WebSocket** : Diffusion temps réel via Socket.io (non inclus dans ce dépôt mais prévu dans l'architecture)

---

## 🛣️ **API REST**

- **Routes Express** définies dans `routes/` (auth, user, admin, article, health, etc.)
- **Contrôleurs** dans `controllers/` pour séparer la logique métier
- **Middlewares** pour l'authentification, l'autorisation, la journalisation
- **Gestion des erreurs** centralisée

---

## 🔐 **Sécurité**

- **Authentification** : JWT ou sessions (selon config)
- **Autorisation** : Middleware admin, vérification des droits sur les routes sensibles
- **Validation** : Contrôle des entrées utilisateur
- **Sécurité des fichiers** : Upload sécurisé dans `uploads/`

---

## ⚡ **Points Clés de l'Architecture**

- **Scalabilité** : Séparation claire des responsabilités, extensible vers microservices
- **Performance** : Utilisation de MongoDB pour le chat/médias, Redis pour le cache
- **Cohérence** : MySQL reste la source de vérité pour les données critiques
- **Extensibilité** : Ajout facile de nouvelles routes, middlewares ou services

---

## 📋 **Fichiers de Configuration Importants**

- `config/db.js` : Connexion MySQL
- `config/init.js` : Initialisation globale
- `config/email.js` : Paramètres d'envoi d'emails
- `config/logger.js` : Configuration du logger

---

## 🧩 **Exemple de Flux Backend**

1. **Requête API** reçue sur une route Express
2. **Middleware** d'authentification/autorisation exécuté
3. **Contrôleur** traite la logique métier (lecture/écriture MySQL ou MongoDB)
4. **Utilitaires** (ex : email, sécurité) appelés si besoin
5. **Réponse** envoyée au client (ou diffusion WebSocket si applicable)

---

## 🚦 **Résumé**

L'architecture backend Express d'IVEN combine robustesse, performance temps réel et gestion avancée des médias, tout en restant simple à maintenir et à faire évoluer. Elle s'appuie sur des standards éprouvés (Express, MySQL, MongoDB, Redis) et une organisation claire du code pour garantir la qualité et la sécurité du service.