const express = require('express');
const router = express.Router();
const { upload, uploadFile } = require('../middleware/fileUploadMiddleware'); // Import your multer middleware
const { uploadFiles, getUploadedFiles } = require('../controllers/uploadController'); // Import controllers
const { protect } = require('../middleware/authMiddleware'); // Import authentication middleware

// File upload route
router.post('/upload', protect, upload.array('files'), uploadFiles); // Use multer middleware for file upload

// Fetch uploaded files route
router.get('/uploads', protect, getUploadedFiles); // Use auth middleware to protect the route

module.exports = router;
