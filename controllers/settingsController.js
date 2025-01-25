const User = require('../models/user');  // Ensure correct path to the User model
const bcrypt = require('bcrypt');

// Update user settings
exports.updateSettings = async (req, res) => {
    const { username, email, oldPassword, newPassword } = req.body;

    console.log('Update settings function called with data:', {
        username,
        email,
        oldPassword,
        newPassword,
    });

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        console.log('User found:', user);

        // Update username and email
        if (username) user.username = username;
        if (email) user.email = email;

        // If the user wants to change the password
        if (oldPassword && newPassword) {
            const passwordMatch = await bcrypt.compare(oldPassword, user.password);
            if (!passwordMatch) {
                return res.status(400).json({ error: 'Old password is incorrect.' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            console.log('Password updated for user:', user.id);
        }

        await user.save();
        console.log('User settings updated successfully');

        res.status(200).json({ success: true, message: 'Settings updated successfully.' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Server error while updating settings.' });
    }
};
