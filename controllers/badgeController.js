// badgeController.js
const User = require('../models/user');
const Badge = require('../models/badge');

// Unlock badge for a user if they meet the points threshold
exports.unlockBadge = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Define badge thresholds (points required for each badge)
        const badgeThresholds = [
            { name: 'Bronze', pointsRequired: 500 },
            { name: 'Silver', pointsRequired: 1000 },
            { name: 'Gold', pointsRequired: 2000 },
        ];

        // Check which badges the user has earned
        for (const badge of badgeThresholds) {
            if (user.points >= badge.pointsRequired && !user.badges.includes(badge.name)) {
                // Award the badge
                user.badges.push(badge.name);
                console.log(`Awarded ${badge.name} badge to user ${userId}`);
            }
        }

        await user.save();

        return { message: 'Badges updated', badges: user.badges };
    } catch (error) {
        console.error('Error unlocking badge:', error);
        return { error: 'Failed to unlock badge' };
    }
};
