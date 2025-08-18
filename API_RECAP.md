# 📌 API RECAP – Projet Iven (aligné avec init.sql)

## 🔑 Authentification & Utilisateurs
### Endpoints
- **POST /api/auth/register**  
  - Body : username, email, password, fname, lname  
  - Génère `confirmation_code` + `confirmation_code_expires` (validation mail/sms possible).  
- **POST /api/auth/login**  
  - Body : email + password  
  - Retourne JWT si `active=1`.  
- **POST /api/auth/confirm**  
  - Vérifie `confirmation_code` et active le compte (`active=1`).  
- **POST /api/auth/reset-password/request**  
  - Génère `reset_token` + `reset_token_expires` et envoie un lien.  
- **POST /api/auth/reset-password/confirm**  
  - Vérifie `reset_token` et met à jour `password`.  
- **GET /api/users/me**  
  - Infos utilisateur connecté.  
- **PATCH /api/users/me**  
  - Mise à jour profil (`fname`, `lname`, `username`, `email`).  

### Table `users`
- `id`, `username`, `email`, `password`  
- `fname`, `lname`  
- `active` (0=non confirmé, 1=actif)  
- `confirmation_code`, `confirmation_code_expires`  
- `reset_token`, `reset_token_expires`  
- `created_at`, `updated_at`  

---

## 📅 Gestion des Événements
### Endpoints
- **POST /api/events** → créer un événement  
- **GET /api/events** → liste des événements de l’utilisateur  
- **GET /api/events/:id** → détail d’un événement  
- **PATCH /api/events/:id** → modifier un événement  
- **DELETE /api/events/:id** → supprimer un événement  

### Table `events`
- `id`, `owner_id` (FK → users.id)  
- `title`, `description`, `date`, `location`  
- `created_at`, `updated_at`  

---

## 👥 Participants
### Endpoints
- **POST /api/events/:id/participants** → inviter un utilisateur  
- **PATCH /api/events/:id/participants/:pid** → changer rôle  
- **DELETE /api/events/:id/participants/:pid** → retirer un participant  

### Table `event_participants`
- `id`, `event_id`, `user_id`  
- `role` ENUM('owner', 'participant')  
- `created_at`, `updated_at`  

---

## ✅ Tâches (Tasks)
### Endpoints
- **POST /api/events/:id/tasks** → créer une tâche  
- **GET /api/events/:id/tasks** → liste des tâches  
- **PATCH /api/events/:id/tasks/:tid** → modifier (titre, description, status, validated_by)  
- **DELETE /api/events/:id/tasks/:tid** → supprimer  

### Table `event_tasks`
- `id`, `owner_id`, `event_id`  
- `title`, `description`  
- `validated_by` (FK → users.id, null si pas encore validée)  
- `status` ENUM('pending','completed')  
- `created_at`, `updated_at`  

---

## 💰 Dépenses (Expenses)
### Endpoints
- **POST /api/events/:id/expenses** → ajouter une dépense  
- **GET /api/events/:id/expenses** → liste des dépenses  
- **PATCH /api/events/:id/expenses/:eid** → modifier une dépense  
- **DELETE /api/events/:id/expenses/:eid** → supprimer  

### Table `event_expenses`
- `id`, `owner_id`, `event_id`  
- `title`, `description`  
- `paid_by` (FK → users.id)  
- `amount` (DECIMAL 10,2)  
- `created_at`, `updated_at`  

---

## 💬 Chat & Collaboration (MongoDB)
- **WS /api/events/:id/messages** → envoi/réception temps réel  
- **GET /api/events/:id/messages** → récupérer historique  

### Collections
- `event_messages` (eventId, userId, message, timestamp)  
- `notifications` (userId, type, message, read)  
- `activity_logs` (userId, action, timestamp)  
- `file_uploads` (fileId, path, metadata)  

---

## 🖼️ Médias (Volume Docker)
- Stockage dans `/app/uploads` monté en volume Docker persistant.  

### Endpoints
- **POST /api/media/upload** → upload fichier (multipart)  
- **GET /api/media/:id** → récupérer un fichier  
- **DELETE /api/media/:id** → supprimer un fichier  

---

## ⚙️ Sécurité & Middleware
- **JWT Auth** sauf `register/login/confirm/reset-password`.  
- **RBAC** :  
  - Owner → full access  
  - Participant → accès limité (lecture, chat, tâches assignées)  
- **Rate limiting** sur login/register (Redis).  
- **Validation** avec Zod sur inputs.  

---

## 🚀 Priorités de Dev (alignées DB)
1. **Auth complet** avec confirmation + reset password.  
2. **Events CRUD** (MySQL).  
3. **Participants** (liens entre users & events).  
4. **Tasks** avec validation (`validated_by`).  
5. **Expenses** avec gestion des paiements.  
6. **Chat MongoDB + WS**.  
7. **Upload médias via Docker volume**.  
