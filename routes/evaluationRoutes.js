const express = require('express');
const { evaluateProject } = require('../controllers/evaluationController');
const { protect } = require('../middleware/authMiddleware');  // Corrected import from authMiddleware.js
const router = express.Router();

// Apply the protect middleware to secure the '/evaluate' route
router.post('/evaluate', protect, evaluateProject);

module.exports = router;
