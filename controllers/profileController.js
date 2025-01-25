const User = require('../models/user');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            name: user.name,
            email: user.email,
            bio: user.bio,
            profilePicture: user.profilePicture,
            points: user.points,
            badges: user.badges
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error: error.message });
    }
};

// Update user profile
// In your profileController.js
exports.updateProfile = async (req, res) => {
    const { name, email, bio, password } = req.body;

    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User  not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.bio = bio || user.bio;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Handle profile picture upload
        if (req.file) {
            user.profilePicture = req.file.path; // Ensure this is a valid path
        }

        await user.save();
        res.status(200).json({ message: 'Profile updated successfully', profilePicture: user.profilePicture });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};