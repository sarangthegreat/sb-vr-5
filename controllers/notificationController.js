const Notification = require('../models/notification');
const User = require('../models/user'); // To fetch all users

// Get notifications for a user (including global notifications)
exports.getNotifications = async (req, res) => {
    try {
        console.log('Fetching notifications for user:', req.user);

        if (!req.user || !req.user._id) {
            console.error('User ID not found in request object.');
            return res.status(401).json({ error: 'Unauthorized: User not authenticated.' });
        }

        // Fetch user-specific and global notifications
        const notifications = await Notification.find({
            $or: [{ userId: req.user._id }, { global: true }],
        }).sort({ date: -1 });

        console.log('Notifications fetched successfully:', notifications);
        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Server error while fetching notifications.' });
    }
};

// Create a new notification (user-specific or global)
exports.createNotification = async (userId, title, message, global = false) => {
    try {
        const notification = new Notification({
            userId: global ? undefined : userId, // `userId` is only set if not global
            global,
            title,
            message,
            date: new Date(),
        });
        await notification.save();
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Notify all users by creating individual notifications
exports.notifyAllUsersIndividually = async (title, message) => {
    try {
        const users = await User.find({});
        for (const user of users) {
            await exports.createNotification(user._id, title, message);
        }
    } catch (error) {
        console.error('Error notifying all users individually:', error);
    }
};

// Notify all users using a global notification
exports.notifyAllUsersGlobally = async (title, message) => {
    try {
        await exports.createNotification(null, title, message, true);
    } catch (error) {
        console.error('Error creating global notification:', error);
    }
};
