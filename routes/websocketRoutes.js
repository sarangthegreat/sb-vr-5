// C:\Users\saran\sb-vr-5\routes\websocketRoutes.js

const express = require('express');
const { initWebSocket } = require('../controllers/websocketController');

const router = express.Router();

// Initialize WebSocket for real-time communication
router.ws('/notifications', initWebSocket);

module.exports = router;
