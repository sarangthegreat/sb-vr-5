// C:\Users\saran\sb-vr-5\controllers\projectController.js

const User = require('../models/user');
const Project = require('../models/project');
const Achievement = require('../models/achievement');
const Badge = require('../models/badge');
const { unlockBadge } = require('./badgeController');

// Function to complete a project and award points
const completeProject = async (userId, projectId) => {
    try {
        // Award base points
        const basePoints = 50;

        // Find the project and check its status
        const project = await Project.findById(projectId);
        if (!project || project.status !== 'active') {
            throw new Error('Project is not active or does not exist.');
        }

        // Update the user's points
        const user = await User.findById(userId);
        user.totalPoints += basePoints;
        await user.save();

        // Create an achievement record
        const achievement = new Achievement({
            userId: userId,
            projectId: projectId,
            pointsEarned: basePoints,
        });
        await achievement.save();

        // Check for badge eligibility
        await unlockBadge(userId);

        // Initiate evaluation with ChatGPT if applicable
        // Call to ChatGPT evaluation function
        // await evaluateProjectWithChatGPT(projectId);

        console.log(`User ${userId} completed project ${projectId} and earned ${basePoints} points.`);
    } catch (error) {
        console.error('Error completing project:', error);
    }
};

module.exports = {
    completeProject,
};
