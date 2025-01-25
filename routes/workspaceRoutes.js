const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware'); // Middleware for user authentication

// Debugging: Log imported controller methods and middleware
console.log('workspaceController:', {
    uploadFiles: workspaceController.uploadFiles,
    getTasks: workspaceController.getTasks,
    updateTask: workspaceController.updateTask,
    saveNotes: workspaceController.saveNotes,
    getProjectDetails: workspaceController.getProjectDetails,
    submitProject: workspaceController.submitProject,
    askQuestion: workspaceController.askQuestion,
});
console.log('protect middleware:', protect);

// File upload route
router.post('/upload', protect, workspaceController.upload.array('files'), workspaceController.uploadFiles);

// Get tasks for a specific project
router.get('/tasks', protect, (req, res, next) => {
    console.log('Received request for tasks for project:', req.query.projectId); // Debugging
    next();
}, workspaceController.getTasks);

// Update task completion status
router.patch('/tasks/:taskId', protect, (req, res, next) => {
    console.log('Updating task completion status for Task ID:', req.params.taskId); // Debugging
    console.log('Request body:', req.body); // Debugging
    next();
}, workspaceController.updateTask);

// Save notes for a specific project
router.post('/notes', protect, (req, res, next) => {
    console.log('Saving notes for project:', req.query.projectId); // Debugging
    console.log('Notes data:', req.body); // Debugging
    next();
}, workspaceController.saveNotes);

// Get project details for a specific project
router.get('/project/:projectId', protect, (req, res, next) => {
    console.log('Received request for project details for Project ID:', req.params.projectId); // Debugging
    next();
}, workspaceController.getProjectDetails);

// Submit project for evaluation
router.post('/project/:projectId/submit', protect, (req, res, next) => {
    console.log('Submitting project for evaluation, Project ID:', req.params.projectId); // Debugging
    next();
}, workspaceController.submitProject);

// Get uploaded files
router.get('/uploads', protect, workspaceController.getUploadedFiles);

module.exports = router;
