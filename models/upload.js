const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Removed the extra space
    },
    fileName: {
        type: String,
        required: [true, 'File name is required']
    },
    filePath: {
        type: String,
        required: [true, 'File path is required']
    },
    fileType: {
        type: String,
        required: [true, 'File type is required']
    },
    size: {
        type: Number,
        required: [true, 'File size is required'],
        min: [1, 'File size must be greater than 0']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Upload', uploadSchema);
