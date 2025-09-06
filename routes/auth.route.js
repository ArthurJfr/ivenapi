const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * POST /auth/register
 * Inscription d'un nouvel utilisateur.
 *
 * Body: { email: string, password: string, firstName?: string, lastName?: string }
 * Auth: Public
 * Retour: 201 Utilisateur créé + token, ou 400/409 en cas d'erreur
 */
router.post('/register', authController.register);

/**
 * POST /auth/login
 * Authentifie un utilisateur et renvoie un jeton.
 *
 * Body: { email: string, password: string }
 * Auth: Public
 * Retour: 200 Token + informations utilisateur, ou 401 en cas d'échec
 */
router.post('/login', authController.login);

/**
 * POST /auth/logout
 * Déconnecte l'utilisateur courant (invalidation côté serveur si applicable).
 *
 * Auth: Recommandé (selon implémentation)
 * Retour: 200 Confirmation de déconnexion
 */
router.post('/logout', authController.logout);

/**
 * POST /auth/forgot-password
 * Déclenche l'envoi d'un email de réinitialisation de mot de passe.
 *
 * Body: { email: string }
 * Auth: Public
 * Retour: 200 Confirmation d'envoi
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * POST /auth/confirm
 * Confirme l'adresse email de l'utilisateur via un code/token.
 *
 * Body: { token: string }
 * Auth: Public
 * Retour: 200 Confirmation de l'email
 */
router.post('/confirm', authController.confirmEmail);

/**
 * POST /auth/resend-confirmation-email
 * R'envoie l'email de confirmation à l'utilisateur.
 *
 * Body: { email: string }
 * Auth: Public
 * Retour: 200 Confirmation d'envoi
 */
router.post('/resend-confirmation-email', authController.resendConfirmationEmail);

/**
 * GET /auth/is-connected
 * Vérifie si l'utilisateur est authentifié (selon le contexte/session/token).
 *
 * Auth: Public
 * Retour: 200 { connected: boolean }
 */
router.get('/is-connected', authController.isConnected);

/**
 * GET /auth/user/:id
 * Récupère les informations d'un utilisateur par son identifiant.
 *
 * Params: { id: string }
 * Auth: Protégé selon implémentation
 * Retour: 200 Détails de l'utilisateur
 */
router.get('/user/:id', authController.getUserById);

/**
 * PUT /auth/user/:id
 * Met à jour les informations d'un utilisateur par son identifiant.
 *
 * Params: { id: string }
 * Auth: Protégé selon implémentation
 * Retour: 200 Détails de l'utilisateur
 */
router.put('/user/:id', authController.updateUser);

module.exports = router;