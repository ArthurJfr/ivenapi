# Iven API Documentation

## 🔐 Contrôleur d'Authentification (`/api/auth`)

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "password123",
  "fname": "Prénom",
  "lname": "Nom"
}   
```

**Réponse :**
```json
{
  "message": "Inscription réussie ! Un code de confirmation à 6 chiffres a été envoyé à votre email.",
  "userId": 123
}
```

### Confirm Email (Code à 6 chiffres)
```
POST /api/auth/confirm
Content-Type: application/json

{
  "email": "testuser@example.com",
  "code": "123456"
}
```

**Réponse succès :**
```json
{
  "message": "Compte activé avec succès",
  "email": "testuser@example.com",
  "token": "jwt_token_here",
  "user": {
    "id": 123,
    "username": "testuser",
    "email": "testuser@example.com",
    "active": 1
  }
}
```

**Réponse erreur :**
```json
{
  "message": "Code invalide ou expiré",
  "error": "Le code de confirmation est incorrect ou a expiré. Veuillez demander un nouveau code."
}
```

### Resend Confirmation Code
```
POST /api/auth/resend-confirmation-email
Content-Type: application/json

{
  "email": "testuser@example.com"
}
```

**Réponse :**
```json
{
  "message": "Nouveau code de confirmation envoyé par email"
}
```

### Login
```
POST /api/auth/login                                
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Réponse succès :**
```json
{
  "message": "Connexion réussie",
  "token": "jwt_token_here",
  "user": {
    "id": 123,
    "username": "testuser",
    "email": "testuser@example.com",
    "active": 1,
    "fname": "Prénom",
    "lname": "Nom"
  }
}
```

**Réponse compte non activé :**
```json
{
  "message": "Votre compte n'est pas activé",
  "code": "not-activated",
  "user": {
    "username": "testuser",
    "fname": "Prénom",
    "lname": "Nom",
    "email": "testuser@example.com",
    "active": 0
  }
}
```

### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "testuser@example.com"
}
```

**Réponse :**
```json
{
  "message": "Instructions de réinitialisation envoyées par email"
}
```

### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "message": "Déconnexion réussie"
}
```

## 📅 Contrôleur d'Événements (`/api/event`)

### Créer un événement
```
POST /api/event/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Titre de l'événement",
  "description": "Description de l'événement",
  "start_date": "2024-01-15T10:00:00Z",
  "end_date": "2024-01-15T18:00:00Z",
  "location": "Lieu de l'événement",
  "owner_id": 123
}
```

**Réponse :**
```json
{
  "id": 1,
  "title": "Titre de l'événement",
  "description": "Description de l'événement",
  "start_date": "2024-01-15T10:00:00Z",
  "end_date": "2024-01-15T18:00:00Z",
  "location": "Lieu de l'événement",
  "owner_id": 123
}
```

### Mettre à jour un événement
```
PUT /api/event/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Nouveau titre de l'événement",
  "description": "Nouvelle description de l'événement",
  "start_date": "2024-01-16T10:00:00Z",
  "end_date": "2024-01-16T18:00:00Z",
  "location": "Nouveau lieu de l'événement"
}
```

**Réponse :**
```json
{
  "message": "Événement mis à jour avec succès",
  "event": {
    "id": 1,
    "title": "Nouveau titre de l'événement",
    "description": "Nouvelle description de l'événement",
    "start_date": "2024-01-16T10:00:00Z",
    "end_date": "2024-01-16T18:00:00Z",
    "location": "Nouveau lieu de l'événement",
    "owner_id": 123,
    "updated_at": "2024-01-15T15:30:00Z"
  }
}
```

**Erreurs possibles :**
```json
{
  "error": "Événement non trouvé"
}
```

```json
{
  "error": "Accès non autorisé. Seul le propriétaire peut modifier cet événement."
}
```

### Supprimer un événement
```
DELETE /api/event/:id
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "message": "Événement supprimé avec succès",
  "eventId": 1
}
```

**Erreurs possibles :**
```json
{
  "error": "Événement non trouvé"
}
```

```json
{
  "error": "Accès non autorisé. Seul le propriétaire peut supprimer cet événement."
}
```

**⚠️ Attention :** La suppression d'un événement supprime également :
- Tous les participants de l'événement
- Toutes les tâches associées à l'événement
- Toutes les dépenses associées à l'événement

### Gérer les participants d'un événement

#### Ajouter un participant
```
POST /api/event/:eventId/participants
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 456,
  "role": "participant"
}
```

**Réponse :**
```json
{
  "message": "Participant ajouté avec succès",
  "participant": {
    "event_id": 1,
    "user_id": 456,
    "role": "participant",
    "username": "nouveau_user",
    "email": "nouveau@example.com"
  }
}
```

**Erreurs possibles :**
```json
{
  "error": "Accès non autorisé. Seul le propriétaire peut ajouter des participants."
}
```

```json
{
  "error": "Cet utilisateur est déjà participant de cet événement"
}
```

#### Retirer un participant
```
DELETE /api/event/:eventId/participants/:userId
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "message": "Participant retiré avec succès",
  "eventId": 1,
  "userId": 456
}
```

**Erreurs possibles :**
```json
{
  "error": "Accès non autorisé. Seul le propriétaire peut retirer des participants."
}
```

```json
{
  "error": "Impossible de retirer le propriétaire de l'événement"
}
```

#### Lister les participants d'un événement
```
GET /api/event/:eventId/participants
```

**Réponse :**
```json
{
  "event_id": 1,
  "participants": [
    {
      "user_id": 123,
      "role": "owner",
      "joined_at": "2024-01-15T10:00:00Z",
      "username": "proprietaire",
      "email": "proprio@example.com",
      "fname": "Prénom",
      "lname": "Nom"
    },
    {
      "user_id": 456,
      "role": "participant",
      "joined_at": "2024-01-15T11:00:00Z",
      "username": "participant1",
      "email": "participant1@example.com",
      "fname": "Prénom2",
      "lname": "Nom2"
    }
  ]
}
```

### Obtenir un événement par ID
```
GET /api/event/:id
```

**Réponse :**
```json
{
  "id": 1,
  "title": "Titre de l'événement",
  "description": "Description de l'événement",
  "start_date": "2024-01-15T10:00:00Z",
  "end_date": "2024-01-15T18:00:00Z",
  "location": "Lieu de l'événement",
  "owner_id": 123
}
```

### Obtenir les événements par propriétaire
```
GET /api/event/owner/:ownerId
```

**Réponse :**
```json
[
  {
    "id": 1,
    "title": "Événement 1",
    "description": "Description 1",
    "start_date": "2024-01-15T10:00:00Z",
    "end_date": "2024-01-15T18:00:00Z",
    "location": "Lieu 1",
    "owner_id": 123
  }
]
```

### Obtenir les événements par participant
```
GET /api/event/participant/:participantId
```

**Réponse :**
```json
[
  {
    "id": 1,
    "title": "Événement 1",
    "description": "Description 1",
    "start_date": "2024-01-15T10:00:00Z",
    "end_date": "2024-01-15T18:00:00Z",
    "location": "Lieu 1",
    "owner_id": 123
  }
]
```

## ✅ Contrôleur de Santé (`/api/health`)

### Health Check Public
```
GET /api/health
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "server": {
      "status": "operational",
      "timestamp": "2024-01-15T10:00:00.000Z",
      "uptime": 3600,
      "environment": "development",
      "version": "1.0.0"
    },
    "services": {
      "mongodb": {
        "status": "healthy",
        "state": "connected",
        "message": "MongoDB is connected and responding"
      },
      "mysql": {
        "status": "healthy",
        "message": "MySQL is connected and responding"
      }
    },
    "performance": {
      "responseTime": "45ms",
      "memory": {
        "used": "45MB",
        "total": "67MB"
      }
    }
  },
  "message": "API health check successful"
}
```

### Health Check Protégé (Authentifié)
```
GET /api/health/protected
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "server": {
      "status": "operational",
      "timestamp": "2024-01-15T10:00:00.000Z",
      "uptime": 3600,
      "environment": "development",
      "version": "1.0.0"
    },
    "user": {
      "id": 123,
      "username": "testuser",
      "email": "testuser@example.com",
      "role": "user",
      "lastLogin": null
    },
    "services": {
      "mongodb": {
        "status": "healthy",
        "state": "connected",
        "message": "MongoDB is connected and responding"
      },
      "mysql": {
        "status": "healthy",
        "message": "MySQL is connected and responding"
      }
    },
    "performance": {
      "responseTime": "45ms",
      "memory": {
        "used": "45MB",
        "total": "67MB"
      }
    },
    "security": {
      "authenticated": true,
      "tokenValid": true,
      "userAuthorized": true
    }
  },
  "message": "Protected health check successful for user testuser"
}
```

## 📋 Contrôleur de Tâches (`/api/task`)

### Créer une tâche
```
POST /api/task/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Titre de la tâche",
  "description": "Description de la tâche",
  "event_id": 1,
  "owner_id": 123
}
```

**Réponse :**
```json
{
  "id": 1,
  "title": "Titre de la tâche",
  "description": "Description de la tâche",
  "event_id": 1,
  "owner_id": 123
}
```

### Mettre à jour une tâche
```
PUT /api/task/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Nouveau titre de la tâche",
  "description": "Nouvelle description de la tâche",
  "status": "in_progress",
  "priority": "high",
  "due_date": "2024-01-20T18:00:00Z",
  "assigned_to": 456
}
```

**Champs modifiables :**
- `title` : Titre de la tâche
- `description` : Description de la tâche
- `status` : Statut de la tâche
- `priority` : Priorité de la tâche
- `due_date` : Date d'échéance
- `assigned_to` : Utilisateur assigné à la tâche

**Réponse :**
```json
{
  "message": "Tâche mise à jour avec succès",
  "task": {
    "id": 1,
    "title": "Nouveau titre de la tâche",
    "description": "Nouvelle description de la tâche",
    "event_id": 1,
    "owner_id": 123,
    "status": "in_progress",
    "priority": "high",
    "due_date": "2024-01-20T18:00:00Z",
    "assigned_to": 456,
    "updated_at": "2024-01-15T16:30:00Z"
  }
}
```

**Erreurs possibles :**
```json
{
  "error": "Tâche non trouvée"
}
```

```json
{
  "error": "Accès non autorisé. Seul le propriétaire peut modifier cette tâche."
}
```

### Obtenir une tâche par ID
```
GET /api/task/:id
```

**Réponse :**
```json
{
  "id": 1,
  "title": "Titre de la tâche",
  "description": "Description de la tâche",
  "event_id": 1,
  "owner_id": 123
}
```

### Obtenir les tâches par événement
```
GET /api/task/event/:eventId
```

**Réponse :**
```json
[
  {
    "id": 1,
    "title": "Tâche 1",
    "description": "Description 1",
    "event_id": 1,
    "owner_id": 123
  }
]
```

### Obtenir les tâches par propriétaire
```
GET /api/task/owner/:ownerId
```

**Réponse :**
```json
[
  {
    "id": 1,
    "title": "Tâche 1",
    "description": "Description 1",
    "event_id": 1,
    "owner_id": 123
  }
]
```

### Obtenir les tâches par participant
```
GET /api/task/participant/:participantId
```

**Réponse :**
```json
[
  {
    "id": 1,
    "title": "Tâche 1",
    "description": "Description 1",
    "event_id": 1,
    "owner_id": 123
  }
]
```


Pour utiliser le nouveau système de codes de confirmation, ajoutez ces colonnes à votre table `users` :

```sql
ALTER TABLE users 
ADD COLUMN confirmation_code VARCHAR(6) NULL,
ADD COLUMN confirmation_code_expires DATETIME NULL;

-- Index pour optimiser les performances (optionnel)
CREATE INDEX idx_users_confirmation_code ON users(confirmation_code, confirmation_code_expires);
```

## 📱 Flux d'authentification pour React Native

1. **Inscription** : L'utilisateur s'inscrit → reçoit un code à 6 chiffres par email
2. **Confirmation** : L'utilisateur saisit le code dans l'app → compte activé
3. **Connexion** : L'utilisateur peut se connecter normalement
4. **Renvoyer code** : Si le code expire, l'utilisateur peut en demander un nouveau

## 🔗 Routes API Résumé

| Méthode | Route | Description | Authentification |
|---------|-------|-------------|------------------|
| POST | `/api/auth/register` | Inscription utilisateur | Non |
| POST | `/api/auth/login` | Connexion utilisateur | Non |
| POST | `/api/auth/logout` | Déconnexion utilisateur | Oui |
| POST | `/api/auth/forgot-password` | Mot de passe oublié | Non |
| POST | `/api/auth/confirm` | Confirmation email | Non |
| POST | `/api/auth/resend-confirmation-email` | Renvoyer code | Non |
| POST | `/api/event/create` | Créer événement | Oui |
| PUT | `/api/event/:id` | Mettre à jour événement | Oui |
| DELETE | `/api/event/:id` | Supprimer événement | Oui |
| GET | `/api/event/:id` | Obtenir événement | Non |
| GET | `/api/event/owner/:ownerId` | Événements par propriétaire | Non |
| GET | `/api/event/participant/:participantId` | Événements par participant | Non |
| POST | `/api/event/:eventId/participants` | Ajouter participant | Oui |
| DELETE | `/api/event/:eventId/participants/:userId` | Retirer participant | Oui |
| GET | `/api/event/:eventId/participants` | Lister participants | Non |
| GET | `/api/health` | Health check public | Non |
| GET | `/api/health/protected` | Health check protégé | Oui |
| POST | `/api/task/create` | Créer tâche | Oui |
| PUT | `/api/task/:id` | Mettre à jour tâche | Oui |
| GET | `/api/task/:id` | Obtenir tâche | Non |
| GET | `/api/task/event/:eventId` | Tâches par événement | Non |
| GET | `/api/task/owner/:ownerId` | Tâches par propriétaire | Non |
| GET | `/api/task/participant/:participantId` | Tâches par participant | Non |

