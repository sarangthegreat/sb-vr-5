const mongoose = require('mongoose');

const qaSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Project'  // Reference to the Project model
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'  // Reference to the User model
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        default: ''  // Initially empty, filled after ChatGPT provides an answer
    },
    isAdminQuestion: {
        type: Boolean,
        default: false  // Default is user question, set to true for admin questions
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    answeredAt: {
        type: Date
    }
});

module.exports = mongoose.model('QA', qaSchema);
