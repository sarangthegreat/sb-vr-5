// C:\Users\saran\sb-vr-5\routes\registerRoutes.js

const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController'); // Import from authController

// POST route for user registration
router.post('/', registerUser); // Directly use the registerUser function

module.exports = router;
