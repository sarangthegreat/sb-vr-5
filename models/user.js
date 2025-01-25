const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    bio: {
        type: String,
        default: '',
    },
    profilePicture: {
        type: String,  // This will store the file path or URL
        default: 'default-profile.png',  // Default profile picture
    },
    password: {
        type: String,
        required: true,
    },
    points: {
        type: Number,
        default: 0,
    },
    badges: [{
        type: String,
    }],
    completedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    }],
    refreshToken: { 
        type: String, // Stores the user's refresh token
        default: null, 
    },
});

module.exports = mongoose.model('User', userSchema);
