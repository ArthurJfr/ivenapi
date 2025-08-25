# Test du workflow d'invitation - API Iven

## 🎯 **Objectif du test**
Vérifier que le système d'invitation fonctionne correctement sans la route POST d'ajout direct de participants.

## 🔄 **Workflow à tester**

### **Étape 1 : Recherche d'utilisateurs**
```bash
# Rechercher des utilisateurs pour inviter
curl -X GET "http://localhost:3000/api/event/search/users?q=john" \
  -H "Authorization: Bearer OWNER_TOKEN"
```

**Résultat attendu :**
- ✅ Statut 200
- ✅ Liste des utilisateurs trouvés
- ✅ Pas d'utilisateurs déjà participants

### **Étape 2 : Envoi d'invitation**
```bash
# Inviter un utilisateur
curl -X POST "http://localhost:3000/api/event/1/invite" \
  -H "Authorization: Bearer OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 456,
    "message": "Voulez-vous participer à notre événement ?"
  }'
```

**Résultat attendu :**
- ✅ Statut 201
- ✅ Invitation créée avec succès
- ✅ Message de confirmation

### **Étape 3 : Vérification de l'invitation**
```bash
# Voir les invitations de l'événement
curl -X GET "http://localhost:3000/api/event/1/invitations" \
  -H "Authorization: Bearer OWNER_TOKEN"
```

**Résultat attendu :**
- ✅ Statut 200
- ✅ Invitation visible avec statut "pending"

### **Étape 4 : Acceptation de l'invitation**
```bash
# L'utilisateur invité accepte l'invitation
curl -X PUT "http://localhost:3000/api/event/invitations/1/respond" \
  -H "Authorization: Bearer INVITED_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "response": "accepted"
  }'
```

**Résultat attendu :**
- ✅ Statut 200
- ✅ Message : "Invitation acceptée. Vous êtes maintenant participant de l'événement."
- ✅ L'utilisateur est automatiquement ajouté comme participant

### **Étape 5 : Vérification de la participation**
```bash
# Vérifier que l'utilisateur est maintenant participant
curl -X GET "http://localhost:3000/api/event/1/participants"
```

**Résultat attendu :**
- ✅ Statut 200
- ✅ L'utilisateur 456 apparaît dans la liste des participants
- ✅ Rôle : "participant"

## 🚫 **Test de sécurité - Route POST dépréciée**

### **Test : Tentative d'ajout direct de participant**
```bash
# Cette route ne devrait plus exister ou retourner une erreur
curl -X POST "http://localhost:3000/api/event/1/participants" \
  -H "Authorization: Bearer OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 789,
    "role": "participant"
  }'
```

**Résultat attendu :**
- ❌ Statut 404 (route non trouvée) ou 405 (méthode non autorisée)
- ❌ Pas d'ajout de participant

## ✅ **Vérifications finales**

### **Base de données**
1. ✅ Table `event_invitations` contient l'invitation avec statut "accepted"
2. ✅ Table `event_participants` contient le nouvel utilisateur
3. ✅ Contraintes de clés étrangères respectées

### **API**
1. ✅ Route `search-users` fonctionnelle
2. ✅ Route `invite` fonctionnelle
3. ✅ Route `respond` fonctionnelle et ajoute automatiquement le participant
4. ✅ Route POST `participants` dépréciée/inaccessible
5. ✅ Workflow complet d'invitation → participation

### **Sécurité**
1. ✅ Seuls les propriétaires peuvent inviter
2. ✅ Seuls les invités peuvent répondre
3. ✅ Ajout automatique sécurisé via le système d'invitation
4. ✅ Pas d'ajout direct de participants possible

## 🎉 **Résultat attendu**

Le système d'invitation fonctionne parfaitement avec :
- ✅ **Workflow automatisé** : Invitation → Acceptation → Participation automatique
- ✅ **Sécurité renforcée** : Plus d'ajout direct de participants
- ✅ **API simplifiée** : Moins de routes, plus de cohérence
- ✅ **Expérience utilisateur améliorée** : Processus d'invitation clair et intuitif

## 📝 **Notes importantes**

- **L'ajout de participants se fait UNIQUEMENT via le système d'invitation**
- **La méthode `addParticipant` reste utilisée en interne** par le contrôleur
- **Plus de route POST** pour ajouter directement des participants
- **Workflow sécurisé** : Seuls les propriétaires peuvent inviter, seuls les invités peuvent accepter
