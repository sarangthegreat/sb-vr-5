const User = require('../models/user');
const Project = require('../models/project');
const evaluationController = require('./evaluationController'); // Import evaluation controller

// Award points after project completion
exports.awardPoints = async (userId, projectId) => {
    try {
        const user = await User.findById(userId);
        const project = await Project.findById(projectId);

        if (!user || !project) {
            throw new Error('User or Project not found');
        }

        if (project.completedBy.includes(userId)) {
            return { message: 'Project already completed by this user.' };
        }

        // Mark the project as completed
        project.completedBy.push(userId);
        await project.save();

        // Evaluate project quality
        const qualityScore = await evaluationController.evaluateProject(project);

        // Base points for completing the project
        let pointsToAward = 100;

        // Award extra points for high-quality projects
        if (qualityScore > 80) pointsToAward += 50;

        // Update user points
        user.points += pointsToAward;
        await user.save();

        return { message: `Points awarded: ${pointsToAward}`, points: user.points };
    } catch (error) {
        console.error('Error awarding points:', error);
        return { error: 'Failed to award points' };
    }
};
