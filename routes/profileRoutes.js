const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const { profilePictureUpload, uploadFile } = require('../middleware/fileUploadMiddleware');
// Route to get the user's profile (API endpoint)
router.get('/me', authMiddleware.protect, profileController.getProfile);

// Route to update the user's profile (API endpoint)
router.put('/update', authMiddleware.protect, profileController.updateProfile);
// Route to update the user's profile (API endpoint)
router.put('/update', authMiddleware.protect, profilePictureUpload.single('profilePicture'), uploadFile, profileController.updateProfile);
module.exports = router;
