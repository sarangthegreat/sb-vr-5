const multer = require('multer');
const Project = require('../models/project');
const evaluationController = require('./evaluationController'); // Import evaluation controller

// Setup Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

exports.upload = upload;

// File upload handler
exports.uploadFiles = (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files were uploaded' });
    }

    console.log('Uploaded files:', req.files);

    res.status(200).json({
        message: 'Files uploaded successfully!',
        files: req.files.map(file => ({
            originalName: file.originalname,
            path: file.path,
            size: file.size,
        })),
    });
};


// Fetch tasks for a project
exports.getTasks = async (req, res) => {
    const projectId = req.query.projectId;

    if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
    }

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        console.log('Fetched tasks for project:', projectId, project.tasks); // Debugging
        res.status(200).json(project.tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update task completion status
exports.updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'Invalid completed status. Must be boolean.' });
    }

    try {
        const project = await Project.findOneAndUpdate(
            { "tasks.taskId": taskId },
            { $set: { "tasks.$.completed": completed } },
            { new: true }
        );
        if (!project) {
            return res.status(404).json({ message: 'Task or Project not found' });
        }
        console.log('Updated task completion status:', taskId, completed); // Debugging
        res.status(200).json({ message: 'Task updated', project });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Save notes for a project
exports.saveNotes = async (req, res) => {
    const { notes } = req.body;
    const projectId = req.query.projectId;

    if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
    }
    if (!notes || typeof notes !== 'string') {
        return res.status(400).json({ message: 'Invalid notes data. Must be a non-empty string.' });
    }

    try {
        const project = await Project.findByIdAndUpdate(projectId, { $push: { notes } }, { new: true });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        console.log('Saved notes for project:', projectId, notes); // Debugging
        res.status(200).json({ message: 'Notes saved', project });
    } catch (error) {
        console.error('Error saving notes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Fetch project details
exports.getProjectDetails = async (req, res) => {
    const projectId = req.params.projectId;

    if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
    }

    try {
        const project = await Project.findById(projectId).populate('companyId', 'name');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        console.log('Fetched project details:', projectId, project); // Debugging
        res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Submit project and evaluate // 
exports.submitProject = async (req, res) => {
    const { projectId } = req.params;
    const { forceSubmit } = req.body;

    console.log('Submitting project:', { projectId, forceSubmit, headers: req.headers }); // Log request details

    try {
        // Fetch the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if forceSubmit is true
        if (!forceSubmit) {
            return res.status(400).json({ message: 'Submission requires forceSubmit to be true' });
        }

        // Skip evaluation and directly mark as submitted
        project.status = 'submitted';
        project.submittedAt = new Date(); // Optionally log submission timestamp

        await project.save(); // Save the updated project

        return res.status(200).json({ message: 'Project submitted successfully', project });
    } catch (error) {
        console.error('Error submitting project:', error.message);
        return res.status(500).json({ message: 'Failed to submit project' });
    }
};


// Handle asking questions
exports.askQuestion = async (req, res) => {
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
        return res.status(400).json({ message: 'Invalid question. Must be a non-empty string.' });
    }

    try {
        console.log('Received question:', question); // Debugging
        res.status(200).json({ message: 'Question received', data: question });
    } catch (error) {
        console.error('Error in askQuestion:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUploadedFiles = async (req, res) => {
    try {
        // Assuming you want to list files from the 'uploads/' directory
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(__dirname, '../uploads');

        fs.readdir(uploadsDir, (err, files) => {
            if (err) {
                console.error('Error reading uploads directory:', err);
                return res.status(500).json({ message: 'Error fetching uploaded files' });
            }

            res.status(200).json({ files });
        });
    } catch (error) {
        console.error('Error in getUploadedFiles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

