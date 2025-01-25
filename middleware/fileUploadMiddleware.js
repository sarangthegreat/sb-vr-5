const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Upload = require('../models/upload');

// Ensure upload directory exists
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Base upload directory
const BASE_UPLOAD_DIR = path.join(__dirname, '../uploads');

// Dynamic storage for different file types
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = BASE_UPLOAD_DIR;

        if (file.mimetype.startsWith('image')) {
            uploadPath = path.join(uploadPath, 'images');
        } else if (file.mimetype.startsWith('video')) {
            uploadPath = path.join(uploadPath, 'videos');
        } else {
            uploadPath = path.join(uploadPath, 'others');
        }

        ensureDirectoryExists(uploadPath); // Ensure the directory exists
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    },
});

// File filter for allowed file types
const fileFilter = (allowedTypes) => (req, file, cb) => {
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedTypes}`));
    }
};

// General upload middleware
const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10 MB size limit
    fileFilter: fileFilter(/jpeg|jpg|png|mp4|pdf|docx/), // Allow common file types
});

// Middleware for profile picture uploads
const profilePictureUpload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 2 }, // 2 MB size limit
    fileFilter: fileFilter(/jpeg|jpg|png/), // Allow only images
});

// Utility to handle errors
const handleMulterErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message }); // Multer-specific errors
    } else if (err) {
        return res.status(400).json({ message: err.message }); // Other errors
    }
    next();
};

// Middleware to store file metadata in MongoDB
const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            console.log('No file uploaded, proceeding without file metadata');
            return next(); // Proceed if no file is uploaded
        }

        const newUpload = new Upload({
            userId: req.user.id, // Assuming authMiddleware sets req.user
            fileName: req.file.filename,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            size: req.file.size,
        });

        console.log('Saving file metadata:', newUpload);

        await newUpload.save();
        console.log('File metadata saved successfully in MongoDB');
        next();
    } catch (error) {
        console.error('Error saving file metadata:', error);
        res.status(500).json({ message: 'Failed to save file metadata' });
    }
};

// Export middleware and utilities
module.exports = {
    upload,
    profilePictureUpload,
    handleMulterErrors,
    uploadFile,
};
