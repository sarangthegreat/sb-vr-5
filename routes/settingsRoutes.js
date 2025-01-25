const express = require('express');
const router = express.Router();
const { updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware'); // Use curly braces for destructuring

// Debugging logs to check the types of imported functions
console.log('Type of updateSettings:', typeof updateSettings); // Should be 'function'
console.log('Type of protect middleware:', typeof protect); // Should be 'function'

// Route to update user settings
router.post('/settings', protect, updateSettings); // Protect the route

module.exports = router;
