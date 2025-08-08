const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

//router.get('/online-users', adminMiddleware, adminController.getOnlineUsers);

module.exports = router;