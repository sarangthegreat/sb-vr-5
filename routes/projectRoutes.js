// C:\Users\saran\sb-vr-5\routes\projectRoutes.js

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Route for completing a project
router.post('/complete/:userId/:projectId', protect, async (req, res) => {
    const { userId, projectId } = req.params;

    try {
        await projectController.completeProject(userId, projectId);
        res.status(200).json({ message: `Project ${projectId} completed by user ${userId} and points awarded.` });
    } catch (error) {
        console.error('Error completing project:', error);
        res.status(500).json({ message: 'Failed to complete project.' });
    }
});

module.exports = router;
