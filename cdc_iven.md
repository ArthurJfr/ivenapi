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
  - **MySQL 8.0** : Données relationnelles (utilisateurs, événements, tâches, budget)
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
-- Utilisateurs
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    bio TEXT,
    language ENUM('fr', 'en') DEFAULT 'fr',
    theme ENUM('light', 'dark') DEFAULT 'light',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Événements
CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    end_date DATE,
    end_time TIME,
    location VARCHAR(300) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    type ENUM('physique', 'virtuel') NOT NULL,
    category VARCHAR(50) NOT NULL,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    visibility ENUM('public', 'private') DEFAULT 'private',
    max_participants INT,
    allow_invites BOOLEAN DEFAULT true,
    organizer_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_organizer (organizer_id),
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_category (category)
);

-- Participants aux événements
CREATE TABLE event_participants (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    event_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('organizer', 'participant') DEFAULT 'participant',
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    invited_by VARCHAR(36),
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_participant (event_id, user_id),
    INDEX idx_event_user (event_id, user_id),
    INDEX idx_status (status)
);

-- Tâches
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    event_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(36),
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    due_date DATETIME,
    completed_at TIMESTAMP NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_event (event_id),
    INDEX idx_assigned (assigned_to),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);

-- Budget d'événement
CREATE TABLE budgets (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    event_id VARCHAR(36) NOT NULL UNIQUE,
    total_budget DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'EUR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Transactions budgétaires
CREATE TABLE budget_transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    budget_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    type ENUM('expense', 'income') DEFAULT 'expense',
    paid_by VARCHAR(36),
    receipt_url VARCHAR(500),
    transaction_date DATE NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_budget (budget_id),
    INDEX idx_category (category),
    INDEX idx_date (transaction_date)
);

-- Médias
CREATE TABLE media (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    event_id VARCHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INT NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    s3_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    type ENUM('image', 'video', 'document') NOT NULL,
    uploaded_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_event (event_id),
    INDEX idx_type (type),
    INDEX idx_uploaded_by (uploaded_by)
);

-- Sessions utilisateur (optionnel si pas Redis)
CREATE TABLE user_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    data TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at)
);
```

#### 5.3.2 MongoDB - Données Non-Relationnelles

```javascript
// Collection: messages (Chat temps réel)
{
  _id: ObjectId,
  eventId: String,           // Référence à l'événement MySQL
  senderId: String,          // Référence utilisateur MySQL
  senderName: String,        // Dénormalisé pour performance
  senderAvatar: String,      // Dénormalisé pour performance
  type: String,              // 'text', 'image', 'file', 'system'
  content: String,           // Contenu du message
  metadata: {                // Métadonnées selon le type
    filename: String,        // Pour les fichiers
    fileSize: Number,
    fileUrl: String,
    mentions: [String],      // IDs des utilisateurs mentionnés
    replyTo: ObjectId        // ID du message parent
  },
  reactions: [{              // Réactions aux messages
    userId: String,
    emoji: String,
    timestamp: Date
  }],
  isEdited: Boolean,
  editedAt: Date,
  isDeleted: Boolean,
  deletedAt: Date,
  readBy: [{                 // Statut de lecture
    userId: String,
    readAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}

// Index pour messages
db.messages.createIndex({ "eventId": 1, "createdAt": -1 })
db.messages.createIndex({ "senderId": 1 })
db.messages.createIndex({ "createdAt": -1 })

// Collection: notifications
{
  _id: ObjectId,
  userId: String,            // Destinataire
  type: String,              // 'event_invite', 'task_assigned', 'message', 'reminder'
  title: String,
  body: String,
  data: {                    // Données contextuelles
    eventId: String,
    taskId: String,
    senderId: String,
    actionUrl: String
  },
  status: String,            // 'pending', 'sent', 'delivered', 'read'
  channels: [String],        // 'push', 'email', 'in_app'
  scheduledFor: Date,        // Pour notifications programmées
  sentAt: Date,
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Index pour notifications
db.notifications.createIndex({ "userId": 1, "status": 1 })
db.notifications.createIndex({ "scheduledFor": 1 })
db.notifications.createIndex({ "createdAt": -1 })

// Collection: activity_logs (Audit trail)
{
  _id: ObjectId,
  userId: String,
  action: String,            // 'create', 'update', 'delete', 'login'
  resource: String,          // 'event', 'task', 'budget', 'user'
  resourceId: String,
  changes: {                 // Détails des modifications
    before: Object,
    after: Object
  },
  metadata: {
    ip: String,
    userAgent: String,
    location: String
  },
  timestamp: Date
}

// Index pour logs
db.activity_logs.createIndex({ "userId": 1, "timestamp": -1 })
db.activity_logs.createIndex({ "action": 1, "resource": 1 })
db.activity_logs.createIndex({ "timestamp": -1 })

// Collection: file_uploads (Métadonnées temporaires)
{
  _id: ObjectId,
  uploadId: String,          // ID unique de l'upload
  userId: String,
  eventId: String,
  filename: String,
  mimeType: String,
  size: Number,
  chunks: [{                 // Pour upload en chunks
    chunkNumber: Number,
    chunkSize: Number,
    uploaded: Boolean
  }],
  status: String,            // 'uploading', 'completed', 'failed'
  s3Key: String,
  progress: Number,          // Pourcentage
  error: String,
  createdAt: Date,
  completedAt: Date,
  expiresAt: Date            // TTL pour nettoyage automatique
}

// TTL Index pour nettoyage automatique
db.file_uploads.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
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

### 5.5 API REST Endpoints

```typescript
// Routes principales
POST   /api/auth/register          // Inscription
POST   /api/auth/login             // Connexion
POST   /api/auth/logout            // Déconnexion
POST   /api/auth/refresh           // Renouveler JWT
POST   /api/auth/forgot-password   // Mot de passe oublié
POST   /api/auth/reset-password    // Réinitialiser mot de passe

GET    /api/users/profile          // Profil utilisateur
PUT    /api/users/profile          // Modifier profil
POST   /api/users/avatar           // Upload avatar
DELETE /api/users/account          // Supprimer compte

GET    /api/events                 // Liste événements
POST   /api/events                 // Créer événement
GET    /api/events/:id             // Détails événement
PUT    /api/events/:id             // Modifier événement
DELETE /api/events/:id             // Supprimer événement

POST   /api/events/:id/participants // Inviter participants
PUT    /api/events/:id/participants/:userId // Modifier statut participation
DELETE /api/events/:id/participants/:userId // Retirer participant

GET    /api/events/:id/tasks       // Liste tâches
POST   /api/events/:id/tasks       // Créer tâche
PUT    /api/tasks/:id              // Modifier tâche
DELETE /api/tasks/:id              // Supprimer tâche

GET    /api/events/:id/budget      // Budget événement
PUT    /api/events/:id/budget      // Modifier budget
POST   /api/events/:id/budget/transactions // Ajouter transaction
PUT    /api/budget/transactions/:id // Modifier transaction
DELETE /api/budget/transactions/:id // Supprimer transaction

GET    /api/events/:id/media       // Liste médias
POST   /api/events/:id/media       // Upload média
DELETE /api/media/:id              // Supprimer média

GET    /api/events/:id/messages    // Historique chat
POST   /api/events/:id/messages    // Nouveau message
PUT    /api/messages/:id           // Modifier message
DELETE /api/messages/:id           // Supprimer message

GET    /api/notifications          // Liste notifications
PUT    /api/notifications/:id/read // Marquer comme lu
POST   /api/notifications/device   // Enregistrer token device
```

### 5.6 WebSocket Events (Socket.io)

```typescript
// Événements Socket.io
namespace '/events/:eventId' {
  // Connection/Déconnection
  'join_event'     // Rejoindre chat événement
  'leave_event'    // Quitter chat événement
  
  // Chat temps réel
  'new_message'    // Nouveau message
  'message_edited' // Message modifié
  'message_deleted' // Message supprimé
  'typing_start'   // Utilisateur tape
  'typing_stop'    // Utilisateur arrête de taper
  'message_read'   // Message lu
  
  // Notifications temps réel
  'participant_joined'  // Nouveau participant
  'participant_left'    // Participant parti
  'task_updated'        // Tâche modifiée
  'budget_updated'      // Budget modifié
  'event_updated'       // Événement modifié
  
  // Statut utilisateurs
  'user_online'    // Utilisateur en ligne
  'user_offline'   // Utilisateur hors ligne
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
frontend/
├── app/                            # Routes Expo Router
│   ├── +layout.tsx                 # Layout global (theme, AuthContext…)
│   ├── index.tsx                   # Home (dashboard)
│   ├── login.tsx
│   ├── register.tsx
│   ├── profile.tsx
│   ├── settings.tsx
│   ├── create-event.tsx
│   └── events/
│       └── [eventId]/              # Dossier dynamique
│           ├── index.tsx           # Résumé de l’événement
│           ├── tasks.tsx           # Liste des tâches
│           ├── budget.tsx          # Budget collaboratif
│           ├── media.tsx           # Galerie média
│           ├── chat.tsx            # Chat de l’événement
│           └── manage.tsx          # Paramètres de l’événement
├── components/
│   ├── screens/                    # Écrans avec logique métier
│   ├── ui/                         # Composants génériques (Button, Input…)
│   ├── events/                     # EventCard, EventHeader…
│   ├── media/                      # MediaUploader, MediaGrid…
│   ├── chat/                       # MessageBubble, ChatInput…
│   └── hooks/                      # useAuth, useEvent, useUpload…
├── services/                       # api.ts, auth.ts, event.ts, media.ts…
├── contexts/                       # AuthContext, ThemeContext…
├── store/                          # Zustand/Redux (état UI, offline…)
├── types/                          # Typages partagés
├── utils/                          # formatDate, debounce…
├── assets/                         # Icônes, images, polices
└── app.config.ts                   # Configuration Expo
```

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

## 10. Sécurité et Confidentialité

- **RGPD :** droit d’accès, portabilité, suppression  
- **Sauvegardes :** journalières MySQL, continues MongoDB  
- **Chiffrement :** TLS, bcrypt  
- **Audits & Pentests :** réguliers  
- **RBAC :** configuré dans Kubernetes et services  

## 11. Annexes

- Glossaire  
- Diagrammes ERD, séquence upload média  
- Maquettes Figma, docs API  
- Contact : développeur étudiant  
