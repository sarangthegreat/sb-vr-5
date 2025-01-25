// C:\Users\saran\sb-vr-5\models\badge.js

const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    pointsThreshold: {
        type: Number,
        required: true
    },
    awardedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  // Reference to the User model
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;
