# Cahier des Charges Détaillé – Iven (Application Mobile de Gestion d’Événements)

## 1. Contexte et Présentation du Projet

- **Nom du Projet :** Iven  
- **Contexte général :** Besoin croissant d’outils mobiles pour planifier et organiser des événements personnels et professionnels.  
- **Origine du besoin :** Les utilisateurs souhaitent centraliser la création, la gestion et la communication autour d’événements (réunions, fêtes, voyages, anniversaires) dans une interface unique.  
- **Enjeux métier et objectifs stratégiques :**
  - Offrir une expérience fluide du mobile natif via React Native.  
  - Assurer la scalabilité et la performance du backend pour supporter des pics d’utilisation.  
  - Garantir la sécurité et la confidentialité des données utilisateur.  

## 2. Objectifs de l’application

- **Objectifs principaux :**
  1. Création et gestion complète d’événements (physiques ou virtuels).  
  2. Collaboration entre participants (chat, tâches, budget).  
  3. Centralisation des notifications et rappels.  
- **Objectifs secondaires :**
  - Support multi‑langue (Français, Anglais, extensible).  
  - Mode sombre/clair.  
  - Système de feedback et support intégré.  
- **KPI et indicateurs :**
  - Nombre d’événements créés par mois.  
  - Taux d’engagement (messages envoyés, tâches complétées).  
  - Taux de rétention mensuel.  

## 3. Périmètre Fonctionnel

- **Module Authentification :** Inscription, connexion, mot de passe oublié, JWT.  
- **Module Profil utilisateur :** Édition des informations, préférences (langue, thème).  
- **Module Création & Gestion d’Événements :**
  - Création d’un événement : titre, description, type (physique/virtuel), date/heure de début et fin.  
  - Gestion des participants : invitations par nom d’utilisateur ou e‑mail, statut RSVP.  
  - Tableau de bord : liste de tâches, suivi budget, médias.  
- **Module Liste de Tâches :** Création, assignation, suivi de progression, filtres.  
- **Module Budget :** Suivi des dépenses, contributions, répartition automatique.  
- **Module Calendrier :** Vue mensuelle / hebdomadaire des événements à venir.  
- **Module Chat Intégré :** Salon de discussion par événement, historique, notifications.  
- **Module Média :** Espace de stockage par événement pour photos, images et vidéos (upload, visualisation, suppression).  
- **Module Notifications :** Rappels, alertes d’événements, nouveaux messages.  
- **Module Paramètres :** Gestion des préférences (langue, thème, notifications).  
- **Feedback & Support :** Formulaire de contact, FAQ, système de tickets.  

### 3.1 Cas d’Utilisation

1. **Organisateur :** Créer/configurer un événement, inviter participants, gérer tâches, budget et médias.  
2. **Participant :** Accepter invitations, communiquer via chat, consulter tâches et calendrier.  
3. **Visiteur sans compte :** Rejoindre un événement via lien invité, consulter contenu si autorisé.  

## 4. Exigences Non‑Fonctionnelles

- **Performances :** Temps de réponse API < 200 ms, médias servis via CDN.  
- **Sécurité :** JWT, TLS, validation côté serveur, contrôle d’accès sur médias.  
- **Disponibilité :** SLA 99.9 %, réplicas bases de données, redondance stockage objet.  
- **Scalabilité :** Microservices conteneurisés (Docker/Kubernetes), auto‑scaling, CDN.  
- **Compatibilité :** iOS 14+ et Android 8+, résolutions standards.  
- **Accessibilité :** Conformité WCAG 2.1 niveau AA, support screen‑readers.  

## 5. Architecture Technique

### 5.1 Schéma Global

- **Client mobile :** React Native + Expo Router  
- **Backend API :** Express.js + TypeScript (Monolithique)
- **Bases de données :** 
  - **MySQL 8.0** : Données relationnelles (utilisateurs existants, événements, tâches, budget)
  - **MongoDB 6.0** : Chat temps réel, notifications, logs
  - **Redis 7.0** : Cache, sessions, rate limiting
- **Stockage Objet :** AWS S3 (médias)  
- **CDN :** CloudFront pour assets & médias  
- **WebSocket :** Socket.io pour chat temps réel
- **Load Balancer :** Nginx  
- **CI/CD :** GitHub Actions → Docker → AWS ECS

### 5.2 Architecture Backend Express.js

```plaintext
backend/
├── src/
│   ├── app.ts                    # Configuration Express principale
│   ├── server.ts                 # Point d'entrée serveur
│   ├── config/
│   │   ├── database.ts           # Configuration MySQL/MongoDB/Redis
│   │   ├── aws.ts                # Configuration S3
│   │   ├── jwt.ts                # Configuration JWT
│   │   └── socket.ts             # Configuration Socket.io
│   ├── controllers/
│   │   ├── auth.controller.ts    # Authentification
│   │   ├── user.controller.ts    # Gestion utilisateurs
│   │   ├── event.controller.ts   # CRUD événements
│   │   ├── task.controller.ts    # Gestion tâches
│   │   ├── budget.controller.ts  # Gestion budget
│   │   ├── chat.controller.ts    # Chat temps réel
│   │   ├── media.controller.ts   # Upload/download médias
│   │   └── notification.controller.ts
│   ├── models/
│   │   ├── mysql/                # Modèles Sequelize
│   │   │   ├── User.ts
│   │   │   ├── Event.ts
│   │   │   ├── EventParticipant.ts
│   │   │   ├── Task.ts
│   │   │   ├── Budget.ts
│   │   │   ├── BudgetTransaction.ts
│   │   │   └── Media.ts
│   │   └── mongodb/              # Modèles Mongoose
│   │       ├── Message.ts
│   │       ├── Notification.ts
│   │       └── ActivityLog.ts
│   ├── routes/
│   │   ├── index.ts              # Routes principales
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── event.routes.ts
│   │   ├── task.routes.ts
│   │   ├── budget.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── media.routes.ts
│   │   └── notification.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts    # Vérification JWT
│   │   ├── validation.middleware.ts # Validation Joi
│   │   ├── rate-limit.middleware.ts # Rate limiting
│   │   ├── upload.middleware.ts  # Multer pour upload
│   │   └── error.middleware.ts   # Gestion erreurs
│   ├── services/
│   │   ├── auth.service.ts       # Logique métier auth
│   │   ├── event.service.ts      # Logique métier événements
│   │   ├── notification.service.ts # Push notifications
│   │   ├── email.service.ts      # Envoi emails
│   │   ├── s3.service.ts         # Upload S3
│   │   └── socket.service.ts     # Gestion Socket.io
│   ├── utils/
│   │   ├── logger.ts             # Winston logging
│   │   ├── validator.ts          # Schémas Joi
│   │   ├── crypto.ts             # Chiffrement/Hash
│   │   └── helpers.ts            # Fonctions utilitaires
│   ├── types/
│   │   ├── express.d.ts          # Extensions Express
│   │   ├── auth.types.ts
│   │   ├── event.types.ts
│   │   └── api.types.ts
│   └── sockets/
│       ├── chat.socket.ts        # Gestion chat temps réel
│       └── notification.socket.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── api.md                    # Documentation API
│   └── deployment.md
├── scripts/
│   ├── migration.sql             # Scripts MySQL
│   └── seed.ts                   # Données de test
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
├── package.json
├── tsconfig.json
├── jest.config.js
└── .env.example
```

### 5.3 Schémas de Base de Données

#### 5.3.1 MySQL - Données Relationnelles

```sql
-- Utilisateurs (Table EXISTANTE - Structure actuelle confirmée)
-- ATTENTION : Cette table existe déjà avec cette structure exacte
CREATE TABLE users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,           -- Nom d'utilisateur unique
    email VARCHAR(100) NOT NULL,             -- Adresse email
    password VARCHAR(255) NOT NULL,          -- Mot de passe hashé
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    fname VARCHAR(50) NOT NULL,              -- Prénom
    lname VARCHAR(50) NOT NULL,              -- Nom de famille  
    active TINYINT(1) NOT NULL,              -- Compte activé (0/1)
    reset_token VARCHAR(255),                -- Token réinitialisation mdp
    reset_token_expires DATETIME,            -- Expiration token reset
    confirmation_code VARCHAR(6),            -- Code confirmation email
    confirmation_code_expires DATETIME,      -- Expiration code confirmation
    
    -- Index existants (probablement)
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Modifications OPTIONNELLES recommandées (à exécuter séparément)
/*
ALTER TABLE users 
ADD COLUMN avatar_url VARCHAR(500) NULL AFTER lname,
ADD COLUMN bio TEXT NULL AFTER avatar_url,
ADD COLUMN phone VARCHAR(20) NULL AFTER bio,
ADD COLUMN timezone VARCHAR(50) DEFAULT 'Europe/Paris' AFTER phone,
ADD COLUMN notification_preferences JSON DEFAULT '{"email": true, "push": true, "sms": false}' AFTER timezone;
*/

-- Événements (Structure simplifiée)
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Participants aux événements (Structure simplifiée)
CREATE TABLE event_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('owner', 'participant') NOT NULL DEFAULT 'participant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tâches d'événements (Structure simplifiée)
CREATE TABLE event_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    event_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    validated_by INT DEFAULT NULL,
    status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Dépenses d'événements (Structure simplifiée)
CREATE TABLE event_expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    event_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    paid_by INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Note : Les médias sont stockés dans un volume Docker persistant (/app/uploads)
-- Les invitations et messages sont gérés via MongoDB pour les fonctionnalités avancées
```

#### 5.3.2 MongoDB - Chat Temps Réel et Données Non-Relationnelles

```javascript
// Collection: event_messages (Chat temps réel simplifié)
{
  _id: ObjectId,
  eventId: Number,           // Référence events.id MySQL (INT)
  userId: Number,            // Référence users.id MySQL (INT)
  message: String,           // Contenu du message
  timestamp: Date            // Horodatage
}

// Collection: notifications
{
  _id: ObjectId,
  userId: Number,            // Destinataire (INT)
  type: String,              // 'event_invite', 'task_assigned', 'message', 'reminder'
  message: String,           // Contenu de la notification
  read: Boolean,             // Statut de lecture
  timestamp: Date            // Horodatage
}

// Collection: activity_logs (Audit trail)
{
  _id: ObjectId,
  userId: Number,            // INT au lieu de String
  action: String,            // 'create', 'update', 'delete', 'login'
  timestamp: Date            // Horodatage
}

// Collection: file_uploads (Métadonnées fichiers)
{
  _id: ObjectId,
  fileId: String,            // ID unique du fichier
  path: String,              // Chemin dans le volume Docker
  metadata: Object           // Métadonnées du fichier
}
```

### 5.4 Configuration Redis

```typescript
// Structure des clés Redis
const REDIS_KEYS = {
  // Sessions utilisateur
  SESSION: 'session:',
  
  // Cache
  USER_CACHE: 'user:',
  EVENT_CACHE: 'event:',
  EVENT_PARTICIPANTS: 'event:participants:',
  
  // Rate limiting
  RATE_LIMIT: 'rate_limit:',
  
  // Notifications push
  DEVICE_TOKENS: 'device_tokens:',
  
  // Chat
  ONLINE_USERS: 'online_users',
  TYPING_USERS: 'typing:',
  
  // Upload temporaire
  UPLOAD_TOKEN: 'upload_token:',
  
  // Réinitialisation mot de passe
  RESET_TOKEN: 'reset_token:',
  
  // Vérification email
  EMAIL_VERIFICATION: 'email_verify:'
};

// Configuration TTL
const TTL = {
  SESSION: 7 * 24 * 60 * 60,        // 7 jours
  USER_CACHE: 60 * 60,              // 1 heure
  EVENT_CACHE: 30 * 60,             // 30 minutes
  RATE_LIMIT: 60 * 60,              // 1 heure
  UPLOAD_TOKEN: 10 * 60,            // 10 minutes
  RESET_TOKEN: 15 * 60,             // 15 minutes
  EMAIL_VERIFICATION: 24 * 60 * 60  // 24 heures
};
```

### 5.5 API REST Endpoints (Alignés avec API_RECAP.md)

```typescript
// 🔑 Authentification & Utilisateurs
POST   /api/auth/register          // Inscription (username, email, password, fname, lname)
POST   /api/auth/login             // Connexion (email + password)
POST   /api/auth/confirm           // Confirmation compte (confirmation_code)
POST   /api/auth/reset-password/request  // Demande reset (génère reset_token)
POST   /api/auth/reset-password/confirm  // Confirmation reset (reset_token + nouveau password)
GET    /api/users/me               // Profil utilisateur connecté
PATCH  /api/users/me               // Mise à jour profil (fname, lname, username, email)

// 📅 Gestion des Événements
POST   /api/events                 // Créer un événement
GET    /api/events                 // Liste des événements de l'utilisateur
GET    /api/events/:id             // Détail d'un événement
PATCH  /api/events/:id             // Modifier un événement
DELETE /api/events/:id             // Supprimer un événement

// 👥 Participants
POST   /api/events/:id/participants // Inviter un utilisateur
PATCH  /api/events/:id/participants/:pid // Changer rôle
DELETE /api/events/:id/participants/:pid // Retirer un participant

// ✅ Tâches (Tasks)
POST   /api/events/:id/tasks       // Créer une tâche
GET    /api/events/:id/tasks       // Liste des tâches
PATCH  /api/events/:id/tasks/:tid  // Modifier (titre, description, status, validated_by)
DELETE /api/events/:id/tasks/:tid  // Supprimer

// 💰 Dépenses (Expenses)
POST   /api/events/:id/expenses    // Ajouter une dépense
GET    /api/events/:id/expenses    // Liste des dépenses
PATCH  /api/events/:id/expenses/:eid // Modifier une dépense
DELETE /api/events/:id/expenses/:eid // Supprimer

// 💬 Chat & Collaboration (MongoDB)
WS     /api/events/:id/messages    // Envoi/réception temps réel
GET    /api/events/:id/messages    // Récupérer historique

// 🖼️ Médias (Volume Docker)
POST   /api/media/upload           // Upload fichier (multipart)
GET    /api/media/:id              // Récupérer un fichier
DELETE /api/media/:id              // Supprimer un fichier
```

### 5.6 WebSocket Events (Socket.io) - Chat MongoDB

```typescript
// Événements Socket.io pour chat temps réel (MongoDB)
namespace '/events/:eventId' {
  // Connection/Déconnection
  'join_event'     // Rejoindre chat événement
  'leave_event'    // Quitter chat événement
  
  // Chat temps réel (MongoDB)
  'new_message'    // Nouveau message → MongoDB event_messages
  'typing_start'   // Utilisateur tape (Redis cache)
  'typing_stop'    // Utilisateur arrête de taper (Redis)
  
  // Données temps réel synchronisées MySQL ↔ MongoDB
  'participant_joined'  // Nouveau participant (MySQL) → notification (MongoDB)
  'task_updated'        // Tâche modifiée (MySQL) → message système (MongoDB)
  'expense_updated'     // Dépense modifiée (MySQL) → message système (MongoDB)
}
```

Cette architecture monolithique Express.js offre une base solide tout en restant évolutive vers des microservices si nécessaire.

### 5.4 Architecture du Projet Frontend Mobile (React Native + Expo Router)

#### Technologies Principales

- React Native (Expo)  
- Expo Router (filesystem routing)  
- TypeScript  
- React Query  
- Nativewind (Tailwind CSS)  
- Expo ImagePicker  
- Axios  
- React Hook Form + Zod  

#### Structure des Dossiers

```plaintext
Iven/
├── app/                               # Routes Expo Router
│   ├── (auth)/                        # Groupe routes authentification
│   │   ├── _layout.tsx                # Layout auth + KeyboardAvoidingView
│   │   ├── login.tsx                  # Connexion
│   │   ├── register.tsx               # Inscription
│   │   └── forgot-password.tsx        # Mot de passe oublié
│   ├── (tabs)/                        # Groupe routes avec tabs
│   │   ├── _layout.tsx                # Bottom tabs + KeyboardAvoidingView
│   │   ├── index.tsx                  # Home/Dashboard
│   │   ├── events/
│   │   │   ├── _layout.tsx            # Stack navigation événements
│   │   │   ├── index.tsx              # Liste événements (allevents)
│   │   │   └── [id]/                  # Événement dynamique
│   │   │       ├── _layout.tsx        # Tabs événement
│   │   │       ├── index.tsx          # Résumé de l'événement
│   │   │       ├── tasks.tsx          # Liste des tâches
│   │   │       ├── budget.tsx         # Budget collaboratif
│   │   │       ├── media.tsx          # Galerie média
│   │   │       ├── chat.tsx           # Chat de l'événement
│   │   │       └── manage.tsx         # Paramètres de l'événement
│   │   ├── tasks/                     # Section tâches globales
│   │   │   ├── index.tsx              # Liste toutes les tâches
│   │   │   └── [id].tsx               # Détail tâche individuelle
│   │   ├── media/                     # Section médias globaux
│   │   │   ├── index.tsx              # Galerie tous médias
│   │   │   └── [id].tsx               # Visualiseur média individuel
│   │   ├── users/                     # Section utilisateurs
│   │   │   ├── index.tsx              # Liste/recherche utilisateurs
│   │   │   └── [id].tsx               # Profil utilisateur public
│   │   ├── calendar/
│   │   │   └── index.tsx              # Vue calendrier
│   │   └── profile/
│   │       ├── index.tsx              # Profil utilisateur connecté
│   │       └── settings.tsx           # Paramètres app
│   ├── modals/                        # Modales (présentation modale)
│   │   ├── create-event.tsx           # Création événement
│   │   ├── edit-profile.tsx           # Édition profil
│   │   ├── media-viewer.tsx           # Visualiseur média plein écran
│   │   ├── invite-participants.tsx    # Invitation participants
│   │   ├── task-detail.tsx            # Détail/édition tâche
│   │   └── expense-form.tsx           # Ajout/édition dépense
│   ├── notifications/                 # Notifications
│   │   └── index.tsx                  # Liste notifications
│   ├── _layout.tsx                    # Layout global (providers + KeyboardAvoidingView)
│   └── +not-found.tsx                 # Page 404
├── components/
│   ├── ui/                            # Design System (Atomic Design)
│   │   ├── atoms/                     # Composants de base
│   │   │   ├── Button.tsx             # Boutons avec variantes
│   │   │   ├── Input.tsx              # Champs de saisie
│   │   │   ├── Text.tsx               # Texte avec styles
│   │   │   ├── Avatar.tsx             # Avatar utilisateur
│   │   │   ├── Badge.tsx              # Badges/étiquettes
│   │   │   ├── Spinner.tsx            # Indicateur de chargement
│   │   │   ├── Icon.tsx               # Icônes avec thème
│   │   │   └── Divider.tsx            # Séparateurs
│   │   ├── molecules/                 # Composants composés
│   │   │   ├── Card.tsx               # Cartes avec variantes
│   │   │   ├── Modal.tsx              # Modales
│   │   │   ├── SearchBar.tsx          # Barre de recherche
│   │   │   ├── DatePicker.tsx         # Sélecteur de date
│   │   │   ├── ImagePicker.tsx        # Sélecteur d'images
│   │   │   ├── LoadingOverlay.tsx     # Overlay de chargement
│   │   │   ├── EmptyState.tsx         # État vide
│   │   │   └── ErrorBoundary.tsx      # Gestion d'erreurs
│   │   └── organisms/                 # Composants complexes
│   │       ├── Header.tsx             # En-têtes
│   │       ├── BottomTabs.tsx         # Navigation tabs
│   │       ├── ParticipantsList.tsx   # Liste participants
│   │       └── NotificationBanner.tsx # Bannières notifications
│   ├── features/                      # Composants par fonctionnalité
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx          # Formulaire connexion
│   │   │   ├── RegisterForm.tsx       # Formulaire inscription
│   │   │   ├── AuthGuard.tsx          # Protection routes
│   │   │   └── SocialLogin.tsx        # Connexion sociale (optionnel)
│   │   ├── events/
│   │   │   ├── EventCard.tsx          # Carte événement
│   │   │   ├── EventForm.tsx          # Formulaire événement
│   │   │   ├── EventHeader.tsx        # En-tête événement
│   │   │   ├── EventList.tsx          # Liste événements
│   │   │   ├── ParticipantCard.tsx    # Carte participant
│   │   │   ├── InviteModal.tsx        # Modal invitation
│   │   │   └── EventFilters.tsx       # Filtres événements
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx           # Carte tâche
│   │   │   ├── TaskForm.tsx           # Formulaire tâche
│   │   │   ├── TaskList.tsx           # Liste tâches
│   │   │   └── TaskFilters.tsx        # Filtres tâches
│   │   ├── budget/
│   │   │   ├── BudgetSummary.tsx      # Résumé budget
│   │   │   ├── ExpenseCard.tsx        # Carte dépense
│   │   │   ├── ExpenseForm.tsx        # Formulaire dépense
│   │   │   └── BudgetChart.tsx        # Graphique budget (optionnel)
│   │   ├── media/
│   │   │   ├── MediaGrid.tsx          # Grille médias
│   │   │   ├── MediaCard.tsx          # Carte média
│   │   │   ├── MediaUploader.tsx      # Upload média
│   │   │   ├── MediaViewer.tsx        # Visualiseur média
│   │   │   └── MediaFilters.tsx       # Filtres médias
│   │   ├── chat/
│   │   │   ├── MessageBubble.tsx      # Bulle de message
│   │   │   ├── MessageInput.tsx       # Saisie message
│   │   │   ├── MessageList.tsx        # Liste messages
│   │   │   ├── TypingIndicator.tsx    # Indicateur frappe
│   │   │   └── ChatHeader.tsx         # En-tête chat
│   │   ├── calendar/
│   │   │   ├── CalendarView.tsx       # Vue calendrier
│   │   │   ├── EventCalendar.tsx      # Calendrier événements
│   │   │   └── DateSelector.tsx       # Sélecteur date
│   │   └── profile/
│   │       ├── ProfileHeader.tsx      # En-tête profil
│   │       ├── ProfileForm.tsx        # Formulaire profil
│   │       ├── SettingsSection.tsx    # Section paramètres
│   │       └── AvatarUpload.tsx       # Upload avatar
│   ├── screens/                       # Écrans avec logique métier (existant)
│   │   ├── HomeScreen.tsx             # Écran d'accueil
│   │   ├── LoginScreen.tsx            # Écran connexion
│   │   ├── RegisterScreen.tsx         # Écran inscription
│   │   ├── EventsScreen.tsx           # Écran événements
│   │   ├── ProfileScreen.tsx          # Écran profil
│   │   └── SettingsScreen.tsx         # Écran paramètres
│   └── providers/                     # Providers HOC (optionnel)
│       ├── QueryProvider.tsx          # React Query wrapper
│       └── AuthGuardProvider.tsx      # Protection routes wrapper
├── hooks/                             # Hooks personnalisés
│   ├── api/                           # Hooks API (React Query)
│   │   ├── useAuth.ts                 # Authentification
│   │   ├── useEvents.ts               # Événements
│   │   ├── useTasks.ts                # Tâches
│   │   ├── useBudget.ts               # Budget
│   │   ├── useMedia.ts                # Médias
│   │   ├── useChat.ts                 # Chat
│   │   ├── useNotifications.ts        # Notifications
│   │   └── useUsers.ts                # Utilisateurs
│   ├── ui/                            # Hooks UI/UX (essentiels)
│   │   ├── usePermissions.ts          # Permissions (caméra, localisation)
│   │   ├── useImagePicker.ts          # Sélection images/vidéos
│   │   ├── useDebounce.ts             # Debounce recherche
│   │   └── useHaptics.ts              # Retour haptique (optionnel)
│   └── utils/                         # Hooks utilitaires (core)
│       ├── useStorage.ts              # AsyncStorage helpers
│       ├── useNetworkStatus.ts        # État réseau (mode offline)
│       └── useLocation.ts             # Géolocalisation
├── services/                          # Services & API
│   ├── api/
│   │   ├── client.ts                  # Configuration Axios
│   │   ├── auth.service.ts            # API authentification
│   │   ├── events.service.ts          # API événements
│   │   ├── tasks.service.ts           # API tâches
│   │   ├── budget.service.ts          # API budget
│   │   ├── media.service.ts           # API médias + S3
│   │   ├── chat.service.ts            # API chat
│   │   ├── notifications.service.ts   # API notifications
│   │   └── users.service.ts           # API utilisateurs
│   ├── storage/
│   │   ├── secureStorage.ts           # Keychain/Keystore (tokens)
│   │   ├── asyncStorage.ts            # AsyncStorage helpers
│   │   └── cacheStorage.ts            # Cache local (optionnel)
│   ├── notifications/
│   │   ├── pushNotifications.ts       # Push notifications
│   │   └── localNotifications.ts      # Notifications locales
│   ├── media/
│   │   ├── imageProcessor.ts          # Traitement images (resize, etc.)
│   │   └── fileUpload.ts              # Upload S3 avec presigned URLs
│   ├── socket/
│   │   ├── socketClient.ts            # Client Socket.io
│   │   └── chatSocket.ts              # Gestion chat temps réel
│   ├── LoggerService.ts               # Logging (existant)
│   └── utils/
│       ├── analytics.ts               # Analytics (optionnel)
│       └── crashlytics.ts             # Crash reporting (optionnel)
├── contexts/                          # Contextes React
│   ├── ThemeContext.tsx               # Thème (existant)
│   ├── AuthContext.tsx                # Authentification
│   ├── SocketContext.tsx              # WebSocket connexion
│   ├── NotificationContext.tsx        # Notifications in-app
│   └── index.ts                       # Exports centralisés
├── store/                             # Gestion d'état (Zustand)
│   ├── slices/
│   │   ├── authSlice.ts               # État authentification
│   │   ├── eventsSlice.ts             # État événements
│   │   ├── chatSlice.ts               # État chat (messages, typing)
│   │   ├── uiSlice.ts                 # État UI (modales, notifications)
│   │   └── offlineSlice.ts            # État hors ligne (optionnel)
│   ├── middleware/
│   │   ├── persistMiddleware.ts       # Persistance état
│   │   └── devtoolsMiddleware.ts      # Redux DevTools
│   ├── selectors/
│   │   ├── authSelectors.ts           # Sélecteurs auth
│   │   ├── eventsSelectors.ts         # Sélecteurs événements
│   │   └── chatSelectors.ts           # Sélecteurs chat
│   └── index.ts                       # Store principal
├── types/                             # Types TypeScript
│   ├── api/                           # Types API
│   │   ├── auth.types.ts              # Types authentification
│   │   ├── events.types.ts            # Types événements (existant)
│   │   ├── tasks.types.ts             # Types tâches (existant)
│   │   ├── budget.types.ts            # Types budget
│   │   ├── media.types.ts             # Types médias
│   │   ├── chat.types.ts              # Types chat
│   │   ├── notifications.types.ts     # Types notifications
│   │   └── common.types.ts            # Types communs (API responses, etc.)
│   ├── navigation.types.ts            # Types navigation Expo Router
│   ├── storage.types.ts               # Types stockage
│   ├── users.ts                       # Types utilisateurs (existant)
│   ├── categories.ts                  # Types catégories (existant)
│   └── global.d.ts                    # Types globaux
├── utils/                             # Utilitaires
│   ├── formatters/
│   │   ├── date.ts                    # Formatage dates
│   │   ├── currency.ts                # Formatage monnaie
│   │   ├── text.ts                    # Formatage texte
│   │   └── fileSize.ts                # Formatage taille fichiers
│   ├── validators/
│   │   ├── schemas.ts                 # Schémas Zod validation
│   │   ├── rules.ts                   # Règles validation
│   │   └── sanitizers.ts              # Nettoyage données
│   ├── constants/
│   │   ├── colors.ts                  # Couleurs design system
│   │   ├── sizes.ts                   # Tailles et espacements
│   │   ├── typography.ts              # Polices et tailles texte
│   │   ├── config.ts                  # Configuration app
│   │   └── endpoints.ts               # URLs API
│   ├── helpers/
│   │   ├── permissions.ts             # Gestion permissions
│   │   ├── platform.ts                # Détection plateforme iOS/Android
│   │   ├── device.ts                  # Informations device
│   │   ├── navigation.ts              # Helpers navigation
│   │   └── error.ts                   # Gestion erreurs
│   └── transformers/
│       ├── apiTransformers.ts         # Transformation données API
│       └── dataMappers.ts             # Mapping données
├── styles/                            # Styles et thèmes
│   ├── themes/
│   │   ├── light.ts                   # Thème clair
│   │   ├── dark.ts                    # Thème sombre
│   │   └── index.ts                   # Export thèmes
│   ├── tokens/                        # Design tokens
│   │   ├── colors.ts                  # Palette couleurs
│   │   ├── typography.ts              # Système typographique
│   │   ├── spacing.ts                 # Espacements
│   │   ├── shadows.ts                 # Ombres
│   │   └── borders.ts                 # Bordures et radius
│   ├── global.ts                      # Styles globaux (existant)
│   └── animations.ts                  # Animations réutilisables
├── data/                              # Données mock/statiques (existant)
│   ├── events.json                    # Événements mock
│   ├── users.json                     # Utilisateurs mock
│   ├── tasks.json                     # Tâches mock
│   ├── categories.json                # Catégories
│   └── media.json                     # Médias mock
├── assets/                            # Ressources statiques
│   ├── images/                        # Images de l'app
│   ├── icons/                         # Icônes personnalisées
│   ├── fonts/                         # Polices personnalisées (optionnel)
│   └── animations/                    # Animations Lottie (optionnel)
├── __tests__/                         # Tests (optionnel pour MVP)
│   ├── components/                    # Tests composants
│   ├── hooks/                         # Tests hooks
│   ├── services/                      # Tests services
│   └── __mocks__/                     # Mocks pour tests
├── babel.config.js                    # Configuration Babel
├── tailwind.config.js                 # Configuration Tailwind
├── app.json                           # Configuration Expo
├── tsconfig.json                      # Configuration TypeScript
└── package.json                       # Dépendances projet

#### Module Média

- L’utilisateur sélectionne via `expo-image-picker` (photos/vidéos).  
- `uploadMedia(eventId, file)` obtient une presigned URL et uploade sur S3.  
- `MediaScreen` affiche la galerie par événement, rafraîchie via React Query et WebSocket.  

## 6. UI / UX et Design

### 6.1 Charte Graphique

- **Palette de couleurs :**  
  - Bleu primaire : `#1E40AF`  
  - Bleu secondaire : `#3B82F6`  
  - Gris clair : `#F3F4F6`  
  - Gris foncé : `#4B5563`  
  - Blanc : `#FFFFFF`  
- **Typographie :**  
  - Police principale : *Inter* (sans‑serif)  
  - Tailles :  
    - H1 : 24 pt  
    - H2 : 20 pt  
    - Corps : 16 pt  
- **Iconographie :** Feather Icons (monochrome, style fin)  
- **Guidelines :**  
  - Contraste WCAG AA  
  - Espacements (8 pt/16 pt)  
  - Boutons arrondis (rayon 8 pt)  
  - Feedback tactile et visuel (pressState, spinner)  

### 6.2 Maquettes & Wireframes

- **Outil :** Figma  
- **Écrans clés :** Splash, Auth, Dashboard, Détail événement, Galerie média, Formulaire création  
- **Flux utilisateur :** ≤ 3 taps pour chaque fonction majeure  

## 7. Plan de Tests et Validation

- Tests unitaires : Jest (backend), React Native Testing Library (frontend)  
- Tests d’intégration : Supertest, Postman  
- Tests E2E : Detox  
- Tests performance : k6, profiling RN  
- Critères d’acceptation : définis par user stories  

## 8. Déploiement et Exploitation

- CI/CD : GitHub Actions → Docker → Helm → Kubernetes  
- Environnements : dev, staging, prod  
- Monitoring : Prometheus, Grafana, Sentry  
- Logging : ELK Stack  
- Alerting : Slack/Email  
- Support & Maintenance : SLA, procédures de rollback  

## 9. Planning et Ressources

| Phase   | Durée      | Objectifs                            |
|---------|------------|--------------------------------------|
| Phase 1 | 3 semaines | Setup env, Auth, Profil             |
| Phase 2 | 5 semaines | Événements & Participants            |
| Phase 3 | 4 semaines | Tâches & Budget                      |
| Phase 4 | 3 semaines | Chat, Médias, Notifications          |
| Phase 5 | 3 semaines | Tests, Optimisation, Déploiement     |

- **Total :** 18 semaines (~360 J/H)  
- **Ressource :** 1 développeur full‑stack (étudiant)  

### 🚀 Priorités de Dev (alignées avec API_RECAP.md)
1. **Auth complet** avec confirmation + reset password  
2. **Events CRUD** (MySQL)  
3. **Participants** (liens entre users & events)  
4. **Tasks** avec validation (`validated_by`)  
5. **Expenses** avec gestion des paiements  
6. **Chat MongoDB + WS**  
7. **Upload médias via Docker volume**

## 10. Sécurité et Confidentialité

- **RGPD :** droit d’accès, portabilité, suppression  
- **Sauvegardes :** journalières MySQL, continues MongoDB  
- **Chiffrement :** TLS, bcrypt  
- **Audits & Pentests :** réguliers  
- **RBAC :** 
  - Owner → full access  
  - Participant → accès limité (lecture, chat, tâches assignées)
- **Rate limiting** sur login/register (Redis)
- **Validation** avec Zod sur inputs  

## 11. Annexes

- Glossaire  
- Diagrammes ERD, séquence upload média  
- Maquettes Figma, docs API  
- **Fichiers de référence :**
  - `init.sql` : Structure base de données MySQL
  - `API_RECAP.md` : Endpoints API et priorités de développement
- Contact : développeur étudiant  
