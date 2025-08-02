# Iven API Documentation

## Authentication

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
  "message": "Inscription réussie ! Un code de confirmation à 4 chiffres a été envoyé à votre email.",
  "userId": 123
}
```

### Confirm Email (Code à 4 chiffres)

```
POST /api/auth/confirm-email
Content-Type: application/json

{
  "email": "testuser@example.com",
  "code": "1234"
}
```

**Réponse succès :**
```json
{
  "message": "Compte activé avec succès",
  "email": "testuser@example.com"
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
    "active": 1
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

## 🛠️ Base de données - Migration requise

Pour utiliser le nouveau système de codes de confirmation, ajoutez ces colonnes à votre table `users` :

```sql
ALTER TABLE users 
ADD COLUMN confirmation_code VARCHAR(4) NULL,
ADD COLUMN confirmation_code_expires DATETIME NULL;

-- Index pour optimiser les performances (optionnel)
CREATE INDEX idx_users_confirmation_code ON users(confirmation_code, confirmation_code_expires);
```

## 📱 Flux d'authentification pour React Native

1. **Inscription** : L'utilisateur s'inscrit → reçoit un code à 4 chiffres par email
2. **Confirmation** : L'utilisateur saisit le code dans l'app → compte activé
3. **Connexion** : L'utilisateur peut se connecter normalement
4. **Renvoyer code** : Si le code expire, l'utilisateur peut en demander un nouveau

