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

### Vérifier la connexion (Token JWT)
```
GET /api/auth/is-connected
Authorization: Bearer <token>
```

**Réponse token valide :**
```json
{
  "message": "Utilisateur connecté",
  "isConnected": true,
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

**Réponse token expiré :**
```json
{
  "message": "Token expiré",
  "isConnected": false
}
```

**Réponse token invalide :**
```json
{
  "message": "Token invalide",
  "isConnected": false
}
```

**Réponse sans token :**
```json
{
  "message": "Aucun token fourni",
  "isConnected": false
}
```

### Obtenir un utilisateur par ID
```
GET /api/auth/user/:id
```

**Réponse :**
```json
{
  "id": 123,
  "username": "testuser",
  "email": "testuser@example.com",
  "role": "user",
  "active": 1,
  "fname": "Prénom",
  "lname": "Nom"
}
```

**Erreurs possibles :**
```json
{
  "message": "Erreur lors de la récupération de l'utilisateur"
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

> **ℹ️ Note importante :** L'ajout de participants se fait maintenant exclusivement via le système d'invitation. Les utilisateurs sont automatiquement ajoutés comme participants lorsqu'ils acceptent une invitation.
> 
> **🔧 Note technique :** La méthode `addParticipant` est toujours utilisée en interne par le système d'invitation, mais n'est plus accessible directement via l'API.

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
      "created_at": "2024-01-15T10:00:00.000Z",
      "username": "proprietaire",
      "fname": "Prénom",
      "lname": "Nom"
    },
    {
      "user_id": 456,
      "role": "participant",
      "created_at": "2024-01-15T11:00:00.000Z",
      "username": "participant1",
      "fname": "Prénom2",
      "lname": "Nom2"
    }
  ]
}
```

**Erreurs possibles :**
```json
{
  "error": "Événement non trouvé"
}
```

### **Gestion des invitations d'événements**

> **🔄 Workflow d'invitation :** 
> 1. **Recherche** : Le propriétaire recherche des utilisateurs via `search-users`
> 2. **Invitation** : Il envoie une invitation avec un message personnalisé
> 3. **Notification** : L'utilisateur invité reçoit l'invitation
> 4. **Réponse** : L'utilisateur accepte ou décline l'invitation
> 5. **Intégration** : Si acceptée, l'utilisateur devient automatiquement participant

#### Inviter un utilisateur à un événement
```
POST /api/event/:eventId/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 456,
  "message": "Voulez-vous participer à notre événement ?"
}
```

**Réponse :**
```json
{
  "message": "Invitation envoyée avec succès",
  "invitation": {
    "id": 1,
    "event_id": 1,
    "invited_user": {
      "id": 456,
      "username": "nouveau_user",
      "email": "nouveau@example.com",
      "fname": "Prénom",
      "lname": "Nom"
    },
    "message": "Voulez-vous participer à notre événement ?",
    "expires_at": "2024-01-22T10:00:00.000Z"
  }
}
```

**Erreurs possibles :**
```json
{
  "error": "Accès non autorisé. Seul le propriétaire peut inviter des utilisateurs."
}
```

```json
{
  "error": "Cet utilisateur est déjà participant de cet événement"
}
```

```json
{
  "error": "Cet utilisateur est déjà invité à cet événement"
}
```

#### Voir les invitations d'un événement
```
GET /api/event/:eventId/invitations
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "event_id": 1,
  "invitations": [
    {
      "id": 1,
      "event_id": 1,
      "invited_user_id": 456,
      "invited_by": 123,
      "status": "pending",
      "message": "Voulez-vous participer à notre événement ?",
      "expires_at": "2024-01-22T10:00:00.000Z",
      "created_at": "2024-01-15T10:00:00.000Z",
      "invited_username": "nouveau_user",
      "invited_fname": "Prénom",
      "invited_lname": "Nom",
      "invited_email": "nouveau@example.com"
    }
  ]
}
```

#### Voir ses propres invitations
```
GET /api/event/invitations/user
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "user_id": 456,
  "invitations": [
    {
      "id": 1,
      "event_id": 1,
      "invited_user_id": 456,
      "invited_by": 123,
      "status": "pending",
      "message": "Voulez-vous participer à notre événement ?",
      "expires_at": "2024-01-22T10:00:00.000Z",
      "created_at": "2024-01-15T10:00:00.000Z",
      "event_title": "Titre de l'événement",
      "event_description": "Description de l'événement",
      "start_date": "2024-01-15T10:00:00.000Z",
      "end_date": "2024-01-15T18:00:00.000Z",
      "location": "Lieu de l'événement",
      "inviter_username": "proprietaire",
      "inviter_fname": "Prénom",
      "inviter_lname": "Nom"
    }
  ]
}
```

#### Répondre à une invitation
```
PUT /api/event/invitations/:invitationId/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "response": "accepted"
}
```

**Réponse pour acceptation :**
```json
{
  "message": "Invitation acceptée. Vous êtes maintenant participant de l'événement.",
  "event": {
    "id": 1,
    "title": "Titre de l'événement",
    "start_date": "2024-01-15T10:00:00.000Z",
    "end_date": "2024-01-15T18:00:00.000Z",
    "location": "Lieu de l'événement"
  }
}
```

**Réponse pour déclin :**
```json
{
  "message": "Invitation déclinée.",
  "invitation_id": 1
}
```

**Erreurs possibles :**
```json
{
  "error": "Réponse invalide. Utilisez \"accepted\" ou \"declined\"."
}
```

```json
{
  "error": "Cette invitation a déjà été traitée ou a expiré."
}
```

#### Annuler une invitation
```
DELETE /api/event/invitations/:invitationId
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "message": "Invitation annulée avec succès",
  "invitation_id": 1
}
```

**Erreurs possibles :**
```json
{
  "error": "Accès non autorisé. Seul le propriétaire peut annuler une invitation."
}
```

#### **Rechercher des utilisateurs**
```
GET /api/event/search/users?q=john&eventId=1&excludeParticipants=true
Authorization: Bearer <token>
```

**Paramètres de requête :**
- `q` : Terme de recherche (obligatoire, minimum 2 caractères)
- `eventId` : ID de l'événement pour exclure les participants existants (optionnel)
- `excludeParticipants` : Exclure les participants existants (défaut: true)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 789,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "user",
        "fname": "John",
        "lname": "Doe"
      }
    ],
    "count": 1,
    "searchTerm": "john"
  },
  "message": "1 utilisateur(s) trouvé(s)"
}
```

**Erreurs possibles :**
```json
{
  "error": "Le terme de recherche doit contenir au moins 2 caractères."
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
    "id": 4,
    "owner_id": 3,
    "title": "Réunion équipe",
    "description": "Réunion hebdomadaire",
    "start_date": "2024-01-15T09:00:00.000Z",
    "end_date": "2024-01-15T10:30:00.000Z",
    "location": "Salle de réunion",
    "created_at": "2025-08-21T16:06:05.000Z",
    "updated_at": "2025-08-21T16:06:05.000Z",
    "participants": [
      {
        "user_id": 3,
        "role": "owner",
        "created_at": "2025-08-21T16:06:05.000Z",
        "username": "arthurjfr",
        "fname": "Arthur",
        "lname": "Jaffro "
      }
    ],
    "tasks": [
      {
        "id": 2,
        "owner_id": 3,
        "event_id": 4,
        "title": "acheter pain",
        "description": "acheter pain avant bbq",
        "validated_by": null,
        "created_at": "2025-08-21T16:06:24.000Z",
        "updated_at": "2025-08-21T16:06:24.000Z",
        "owner_username": "arthurjfr",
        "owner_fname": "Arthur",
        "owner_lname": "Jaffro "
      }
    ]
  }
]
```

**Description :**
Cette route retourne tous les événements où l'utilisateur spécifié est participant (soit comme propriétaire, soit comme participant ajouté). Chaque événement inclut :
- **Informations de base** : id, titre, description, dates, lieu, propriétaire
- **Participants** : Liste complète des participants avec leurs rôles et informations
- **Tâches** : Toutes les tâches associées à l'événement avec leurs détails

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
  "description": "Nouvelle description de la tâche"
}
```

**Champs modifiables :**
- `title` : Titre de la tâche
- `description` : Description de la tâche

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
    "validated_by": null,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T16:30:00.000Z"
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
  "owner_id": 123,
  "validated_by": null,
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z"
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
    "owner_id": 123,
    "validated_by": null,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
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
    "owner_id": 123,
    "validated_by": null,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
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
    "owner_id": 123,
    "validated_by": null,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
]
```

### **Valider une tâche**
```
POST /api/task/:id/validate
Authorization: Bearer <token>
```

**Description :** Permet à un utilisateur de valider une tâche créée par un autre utilisateur.

**Règles de validation :**
- Seuls les utilisateurs connectés peuvent valider des tâches
- Un propriétaire ne peut pas valider sa propre tâche
- Une tâche ne peut être validée qu'une seule fois

**Réponse succès :**
```json
{
  "success": true,
  "message": "Tâche validée avec succès",
  "task": {
    "id": 1,
    "title": "Tâche validée",
    "description": "Description de la tâche",
    "event_id": 1,
    "owner_id": 123,
    "validated_by": 456,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T16:30:00.000Z"
  }
}
```

**Erreurs possibles :**
```json
{
  "success": false,
  "error": "Tâche non trouvée"
}
```

```json
{
  "success": false,
  "error": "Vous ne pouvez pas valider votre propre tâche"
}
```

```json
{
  "success": false,
  "error": "Cette tâche est déjà validée"
}
```

### **Annuler la validation d'une tâche**
```
DELETE /api/task/:id/validate
Authorization: Bearer <token>
```

**Description :** Permet au validateur d'annuler sa validation d'une tâche.

**Règles :**
- Seul le validateur peut annuler sa validation
- Nécessite une authentification

**Réponse succès :**
```json
{
  "success": true,
  "message": "Validation de la tâche annulée",
  "task": {
    "id": 1,
    "title": "Tâche",
    "description": "Description de la tâche",
    "event_id": 1,
    "owner_id": 123,
    "validated_by": null,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T16:30:00.000Z"
  }
}
```

**Erreurs possibles :**
```json
{
  "success": false,
  "error": "Tâche non trouvée"
}
```

```json
{
  "success": false,
  "error": "Seul le validateur peut annuler sa validation"
}
```

### **Obtenir les tâches validées par un utilisateur**
```
GET /api/task/validated-by/:userId
```

**Description :** Récupère toutes les tâches validées par un utilisateur spécifique.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "title": "Tâche validée 1",
        "description": "Description 1",
        "event_id": 1,
        "owner_id": 123,
        "validated_by": 456,
        "created_at": "2024-01-15T10:00:00.000Z",
        "updated_at": "2024-01-15T16:30:00.000Z"
      },
      {
        "id": 2,
        "title": "Tâche validée 2",
        "description": "Description 2",
        "event_id": 2,
        "owner_id": 789,
        "validated_by": 456,
        "created_at": "2024-01-15T11:00:00.000Z",
        "updated_at": "2024-01-15T17:00:00.000Z"
      }
    ],
    "count": 2
  },
  "message": "2 tâches validées trouvées"
}
```

---

## 📊 Contrôleur de Logs (`/api/log`)

### Obtenir les logs récents
```
GET /api/log/recent?level=error&limit=50&page=1&days=7&userId=123&search=erreur
```

**Paramètres de requête :**
- `level` : Niveau de log (error, warn, info, http, verbose, debug, silly)
- `limit` : Nombre de logs par page (défaut: 50)
- `page` : Numéro de page (défaut: 1)
- `days` : Nombre de jours à remonter (défaut: 7)
- `userId` : Filtrer par utilisateur spécifique
- `search` : Recherche textuelle dans le message, méthode ou URL

**Réponse :**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "log_id",
        "level": "error",
        "message": "Erreur de connexion à la base de données",
        "timestamp": "2024-01-15T10:00:00.000Z",
        "userId": {
          "_id": 123,
          "username": "testuser",
          "email": "testuser@example.com",
          "fname": "Prénom",
          "lname": "Nom"
        },
        "meta": {
          "method": "POST",
          "url": "/api/auth/login",
          "ip": "192.168.1.1"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 250,
      "itemsPerPage": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "50 logs récupérés sur 250"
}
```

### Obtenir les statistiques des logs
```
GET /api/log/stats?days=7
```

**Paramètres de requête :**
- `days` : Nombre de jours pour les statistiques (défaut: 7)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "period": "7 jours",
    "totalLogs": 1250,
    "levelCounts": {
      "error": 45,
      "warn": 120,
      "info": 850,
      "http": 235
    },
    "dailyStats": [
      {
        "_id": {
          "date": "2024-01-15",
          "level": "error"
        },
        "count": 7
      }
    ]
  },
  "message": "Statistiques des logs récupérées avec succès"
}
```

### Obtenir les logs d'erreur
```
GET /api/log/errors?limit=20&page=1
```

**Paramètres de requête :**
- `limit` : Nombre de logs par page (défaut: 20)
- `page` : Numéro de page (défaut: 1)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "log_id",
        "level": "error",
        "message": "Erreur de validation des données",
        "timestamp": "2024-01-15T10:00:00.000Z",
        "userId": {
          "_id": 123,
          "username": "testuser",
          "email": "testuser@example.com",
          "fname": "Prénom",
          "lname": "Nom"
        },
        "meta": {
          "method": "POST",
          "url": "/api/event/create",
          "ip": "192.168.1.1"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "itemsPerPage": 20
    }
  },
  "message": "20 logs d'erreur récupérés"
}
```

### Obtenir les logs d'un utilisateur spécifique
```
GET /api/log/user/:userId?limit=50&page=1&level=error
```

**Paramètres de requête :**
- `limit` : Nombre de logs par page (défaut: 50)
- `page` : Numéro de page (défaut: 1)
- `level` : Filtrer par niveau de log (optionnel)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "log_id",
        "level": "info",
        "message": "Connexion utilisateur réussie",
        "timestamp": "2024-01-15T10:00:00.000Z",
        "userId": {
          "_id": 123,
          "username": "testuser",
          "email": "testuser@example.com",
          "fname": "Prénom",
          "lname": "Nom"
        },
        "meta": {
          "method": "POST",
          "url": "/api/auth/login",
          "ip": "192.168.1.1"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 75,
      "itemsPerPage": 50
    }
  },
  "message": "50 logs utilisateur récupérés"
}
```

### Nettoyer les anciens logs (Admin)
```
DELETE /api/log/clean?days=30
Authorization: Bearer <token>
```

**Paramètres de requête :**
- `days` : Nombre de jours à conserver (défaut: 30)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "deletedCount": 1250,
    "daysKept": 30
  },
  "message": "1250 anciens logs supprimés (conservés: 30 jours)"
}
```

**⚠️ Attention :** Cette opération est irréversible et supprime définitivement les logs plus anciens que le nombre de jours spécifié.

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
4. **Vérification connexion** : À l'ouverture de l'app, vérifier si le token est encore valide
5. **Renvoyer code** : Si le code expire, l'utilisateur peut en demander un nouveau

### Gestion de la persistance de session

La méthode `is-connected` permet de :
- **Vérifier automatiquement** si l'utilisateur est toujours connecté lors de la réouverture de l'app
- **Gérer les tokens expirés** en redirigeant vers la page de connexion
- **Maintenir l'expérience utilisateur** en évitant de demander les identifiants à chaque fois
- **Retourner les informations utilisateur** si la session est valide

**Utilisation recommandée :**
- Appeler cette méthode au démarrage de l'application
- Stocker le token JWT localement (AsyncStorage/SecureStore)
- Si `isConnected: false`, rediriger vers la page de connexion
- Si `isConnected: true`, rediriger vers l'écran principal avec les données utilisateur

## 🔗 Routes API Résumé

| Méthode | Route | Description | Authentification |
|---------|-------|-------------|------------------|
| POST | `/api/auth/register` | Inscription utilisateur | Non |
| POST | `/api/auth/login` | Connexion utilisateur | Non |
| GET | `/api/auth/is-connected` | Vérifier statut connexion | Non (mais token requis) |
| GET | `/api/auth/user/:id` | Obtenir utilisateur par ID | Non |
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
| DELETE | `/api/event/:eventId/participants/:userId` | Retirer participant | Oui |
| GET | `/api/event/:eventId/participants` | Lister participants | Non |
| POST | `/api/event/:eventId/invite` | Inviter utilisateur | Oui |
| GET | `/api/event/:eventId/invitations` | Voir invitations événement | Oui |
| GET | `/api/event/invitations/user` | Voir ses propres invitations | Oui |
| PUT | `/api/event/invitations/:invitationId/respond` | Répondre à invitation | Oui |
| DELETE | `/api/event/invitations/:invitationId` | Annuler invitation | Oui |
| GET | `/api/event/search/users` | Rechercher utilisateurs | Oui |
| GET | `/api/health` | Health check public | Non |
| GET | `/api/health/protected` | Health check protégé | Oui |
| POST | `/api/task/create` | Créer tâche | Oui |
| PUT | `/api/task/:id` | Mettre à jour tâche | Oui |
| GET | `/api/task/:id` | Obtenir tâche | Non |
| GET | `/api/task/event/:eventId` | Tâches par événement | Non |
| GET | `/api/task/owner/:ownerId` | Tâches par propriétaire | Non |
| GET | `/api/task/participant/:participantId` | Tâches par participant | Non |
| POST | `/api/task/:id/validate` | Valider une tâche | Oui | User+ |
| DELETE | `/api/task/:id/validate` | Annuler validation | Oui | User+ |
| GET | `/api/task/validated-by/:userId` | Tâches validées par un utilisateur | Non | - |
| GET | `/api/log/recent` | Logs récents avec filtres | Non |
| GET | `/api/log/stats` | Statistiques des logs | Non |
| GET | `/api/log/errors` | Logs d'erreur | Non |
| GET | `/api/log/user/:userId` | Logs par utilisateur | Non |
| DELETE | `/api/log/clean` | Nettoyer anciens logs | Oui |
| DELETE | `/api/log/clean-all` | Supprimer tous les logs | Oui | Superadmin |

---


