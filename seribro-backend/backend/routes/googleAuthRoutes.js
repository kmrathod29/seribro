const express = require('express');
const router = express.Router();
const { googleAuthRedirect, googleAuthCallback } = require('../controllers/authController');

// Initiates Google OAuth flow
router.get('/google', googleAuthRedirect);

// OAuth callback (Google will redirect here)
router.get('/google/callback', googleAuthCallback);

module.exports = router;
