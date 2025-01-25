// C:\Users\saran\sb-vr-5\routes\loginRoutes.js

const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController'); // Import from authController

// POST route for user login
router.post('/', loginUser); // Directly use the loginUser function

module.exports = router;
