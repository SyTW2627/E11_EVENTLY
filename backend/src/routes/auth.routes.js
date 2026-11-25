const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/auth/login (SCRUM-68)
router.post('/login', authController.login);

// POST /api/auth/register (SCRUM-68)
router.post('/register', authController.register);

module.exports = router;