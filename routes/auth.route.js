const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/confirm', authController.confirmEmail);
router.post('/resend-confirmation-email', authController.resendConfirmationEmail);

module.exports = router;