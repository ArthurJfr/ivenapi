# 🏗️ Architecture Hybride Iven - Résumé Complet

## 🎯 **Décisions Architecturales**

### **1. 🗄️ Bases de Données Hybrides**

| Composant | Technologie | Raison | Données |
|-----------|-------------|---------|---------|
| **Utilisateurs** | MySQL | Table existante + ACID | users, auth, profils |
| **Événements** | MySQL | Données relationnelles | events, participants, tasks, budget |
| **Chat** | MongoDB | Performance temps réel | messages, réactions, statuts lecture |
| **Médias** | MongoDB | Métadonnées complexes | fichiers, albums, EXIF, commentaires |
| **Notifications** | MongoDB | Flexibilité + volume | notifications, logs |
| **Cache** | Redis | Performance + sessions | cache, typing, presence |

### **2. 🔗 Synchronisation des Données**

#### **Références Croisées**
```typescript
// MongoDB → MySQL
{
  eventId: 1,        // events.id (MySQL)
  senderId: 42,      // users.id (MySQL)
  // ...
}

// Dénormalisation contrôlée
senderInfo: {
  username: "arthur", // Copié de users.username
  fname: "Arthur",   // Copié de users.fname
  // ... performance + évite JOINs
}
```

#### **Flux de Synchronisation**
1. **Écriture** : MySQL (source de vérité) → MongoDB (dénormalisation)
2. **Lecture** : MongoDB (performance) + MySQL (cohérence)
3. **WebSocket** : Diffusion temps réel des changements

---

## 📊 **Structure des Données**

### **MySQL - Données Relationnelles**
```sql
-- Table utilisateurs EXISTANTE (adaptée)
users: id(INT), username, email, fname, lname, active, ...

-- Nouvelles tables événements  
events: id(INT), title, description, created_by → users.id
event_participants: event_id → events.id, user_id → users.id
event_tasks: event_id → events.id, assigned_to → users.id
event_expenses: event_id → events.id, paid_by → users.id
event_invitations: event_id → events.id, inviter_id → users.id
```

### **MongoDB - Chat, Médias & Temps Réel**
```javascript
// Collection event_messages (Chat)
{
  _id: ObjectId,
  eventId: Number,          // → events.id (MySQL)
  senderId: Number,         // → users.id (MySQL)
  senderInfo: {...},        // Dénormalisé pour performance
  type: "text|image|file|system",
  content: String,
  metadata: {...},          // Flexible selon le type
  reactions: [{userId, emoji, timestamp}],
  readBy: [{userId, readAt}],
  isEdited, isDeleted,
  createdAt, updatedAt
}

// Collection event_media (Médias)
{
  _id: ObjectId,
  eventId: Number,          // → events.id (MySQL)
  uploadedBy: Number,       // → users.id (MySQL)
  uploaderInfo: {...},     // Dénormalisé pour performance
  filename: String,
  fileUrl: String,
  thumbnailUrl: String,
  fileType: "image|video|audio|document",
  metadata: {               // EXIF, dimensions, durée, etc.
    dimensions: {width, height},
    exif: {camera, location, timestamp},
    duration: Number        // pour vidéos
  },
  caption: String,
  tags: [String],
  albumId: ObjectId,
  likes: [{userId, timestamp}],
  comments: [{userId, content, timestamp}],
  processingStatus: "uploading|processing|completed|failed",
  visibility: "public|event_participants|private",
  s3Info: {bucket, key, region},
  takenAt, uploadedAt, createdAt
}
```

---

## 🚀 **API & Types TypeScript**

### **Endpoints Unifiés**
```typescript
// MySQL-based
GET  /api/events                  // Liste événements
POST /api/events                  // Créer événement  
GET  /api/events/:id/participants // Participants
GET  /api/events/:id/tasks        // Tâches
GET  /api/events/:id/expenses     // Budget

// MongoDB-based  
GET  /api/events/:id/messages     // Historique chat
POST /api/events/:id/messages     // Nouveau message
POST /api/messages/:id/react      // Réactions
GET  /api/events/:id/media        // Galerie médias
POST /api/events/:id/media        // Upload média
POST /api/media/:id/like          // Like média
POST /api/media/:id/comment       // Commenter média
GET  /api/events/:id/albums       // Albums médias
```

### **Types Cohérents**
```typescript
// Événement (MySQL)
interface Event {
  id: number;              // INT AUTO_INCREMENT
  title: string;
  createdBy: number;       // → users.id
  // ...
}

// Message (MongoDB)
interface EventMessage {
  _id: string;             // ObjectId MongoDB
  eventId: number;         // → events.id (MySQL)
  senderId: number;        // → users.id (MySQL)
  senderInfo: UserInfo;    // Dénormalisé
  // ...
}
```

---

## ⚡ **WebSocket Temps Réel**

### **Événements Socket.io**
```typescript
namespace '/events/:eventId' {
  // Chat (MongoDB)
  'new_message'      // Nouveau message MongoDB
  'message_edited'   // Message modifié MongoDB
  'message_reaction' // Réaction ajoutée MongoDB
  
  // Synchronisation MySQL → MongoDB
  'participant_joined' // MySQL → message système MongoDB
  'task_updated'       // MySQL → notification MongoDB
  'event_updated'      // MySQL → message système MongoDB
  
  // Présence (Redis)
  'user_online'      // Statut utilisateur Redis
  'typing_start'     // Frappe en cours Redis
}
```

---

## 🔧 **Avantages de l'Architecture**

### **Performance** 📈
- **Chat** : MongoDB optimisé pour millions de messages
- **Médias** : MongoDB + GridFS pour gros fichiers et métadonnées complexes
- **Relationnels** : MySQL ACID pour données critiques
- **Cache** : Redis pour sessions et présence temps réel

### **Évolutivité** 🔄
- **Horizontal** : MongoDB sharding automatique
- **Vertical** : MySQL optimisé pour relations complexes
- **Microservices** : Séparation claire possible

### **Développement** 💻
- **Types unifiés** : TypeScript cohérent MySQL ↔ MongoDB
- **API simple** : Interface unique pour frontend
- **Temps réel transparent** : WebSocket seamless

### **Maintenance** 🛠️
- **Source de vérité** : MySQL pour données critiques
- **Performance** : MongoDB pour volume élevé
- **Cohérence** : Synchronisation automatique

---

## 📱 **Impact Frontend**

### **Composants Chat & Médias**
```typescript
// Hook unifié pour messages
const { messages, sendMessage, addReaction } = useEventMessages(eventId);

// Hook unifié pour médias
const { media, uploadMedia, likeMedia, addComment } = useEventMedia(eventId);

// Types automatiquement cohérents
sendMessage({
  content: "Salut !",
  type: "text",
  metadata: {
    mentions: [15, 23] // users.id MySQL
  }
});

uploadMedia({
  files: [imageFile],
  captions: ["Super soirée !"],
  tags: [["soirée", "équipe"]],
  albumName: "Photos 2024"
});
```

### **Navigation Protégée**
```typescript
// Protection basée sur participation MySQL
<ProtectedRoute requireAuth={true}>
  <EventChatScreen eventId={1} />
</ProtectedRoute>
```

---

## 🔐 **Sécurité & Cohérence**

### **Autorisation**
1. **Vérification MySQL** : Participation à l'événement
2. **Accès MongoDB** : Messages de l'événement autorisé
3. **WebSocket** : Rooms par événement avec auth

### **Intégrité**
1. **Transactions MySQL** : ACID pour données critiques
2. **Soft Delete MongoDB** : Conservation historique messages
3. **Synchronisation** : Mise à jour automatique dénormalisation

---

## 🚦 **Flux Complet d'Utilisation**

### **Scénario : Envoi Message**
1. **Frontend** : `sendMessage("Salut !")`
2. **API** : Vérification participation (MySQL)
3. **MongoDB** : Insertion message + dénormalisation user
4. **WebSocket** : Diffusion temps réel participants
5. **Frontend** : Mise à jour UI instantanée

### **Scénario : Nouveau Participant**
1. **API** : Ajout participant (MySQL)
2. **MongoDB** : Message système automatique
3. **WebSocket** : Notification temps réel
4. **Frontend** : Mise à jour liste + chat

---

Cette architecture hybride combine **robustesse relationnelle**, **performance temps réel** et **gestion médias avancée** pour une expérience utilisateur optimale ! 🎉

## 📋 **Fichiers de Configuration**

- **`cdc_iven.md`** : Cahier des charges complet mis à jour
- **`DATABASE_EVENTS_SCHEMA_ADAPTED.sql`** : Schéma MySQL adapté
- **`DATABASE_MONGODB_SCHEMA.md`** : Structure MongoDB détaillée
- **`services/README_EVENTS_API.md`** : API endpoints et types
- **`types/events.ts`** : Types TypeScript synchronisés