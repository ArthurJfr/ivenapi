# Minecraft Server API documentation


## Authentication

### Register

```
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "password123",
  "mc_username" : "MincraftPlayerName"
  "role": "user", //par défaut
  "profile_picture": "https://example.com/profile.jpg"
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



## User


## Articles

### Créer

```
POST /api/articles/create                                
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "password123"
}
```

### Editer

```
POST /api/articles/edit                                
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "password123"
}
```

### Supprimer

```
POST /api/articles/delete                                
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "password123"
}
```
