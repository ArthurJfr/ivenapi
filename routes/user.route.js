const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/get-profilePicture/:username', userController.getProfilePicture);
router.get('/online-users', userController.getOnlineUsers);

module.exports = router;