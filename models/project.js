const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Company'  // Reference to the Company model
    },
    projectId: {
        type: String,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    industry: {
        type: String,
        enum: ['Software', 'Fintech', 'AI', 'Other'],
        required: true  // Specify the industry for project-specific evaluation
    },
    tasks: [{
        taskId: {
            type: String,
            required: true
        },
        taskName: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    }],
    codeQuality: {
        type: Number,
        default: 0,  // Specific to Software projects, range: 0-100
        min: 0,
        max: 100
    },
    unitTests: {
        type: Number,
        default: 0,  // Specific to Software projects, range: 0-100
        min: 0,
        max: 100
    },
    securityStandardsMet: {
        type: Boolean,
        default: false  // Specific to Fintech projects
    },
    regulatoryCompliance: {
        type: Boolean,
        default: false  // Specific to Fintech projects
    },
    modelAccuracy: {
        type: Number,
        default: 0,  // Specific to AI projects, range: 0-100
        min: 0,
        max: 100
    },
    datasetSize: {
        type: Number,
        default: 0  // Specific to AI projects, size in rows or samples
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'pending', 'submitted'],
        default: 'active'
    },
    pointsAwarded: {
        type: Number,
        default: 0  // Default to 0, updated when the project is completed
    },
    qualityScore: {
        type: Number,
        default: 0  // Default to 0, updated after evaluation
    },
    completedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  // Reference to the User model
    }],
    submissionDeadline: {
        type: Date,
        required: true
    },
    applicants: {
        type: Number,
        default: 0  // Total number of applicants for the project
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update the updatedAt field
projectSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Project', projectSchema);
