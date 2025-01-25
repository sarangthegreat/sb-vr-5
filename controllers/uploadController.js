const Upload = require('../models/upload'); // Assuming you have a model for uploads

// File upload handler
exports.uploadFiles = async (req, res) => {
    console.log('Authorization Token:', req.headers.authorization); 
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files were uploaded' });
        }

        // Log uploaded files for debugging
        console.log('Uploaded files:', req.files);

        // Save file metadata in the database
        const uploadedFiles = await Promise.all(req.files.map(async (file) => {
            const newUpload = new Upload({
                userId: req.user.id, // Assuming req.user is set by your auth middleware
                fileName: file.filename,
                filePath: file.path,
                fileType: file.mimetype,
                size: file.size
            });
            return newUpload.save(); // Save to MongoDB
        }));

        res.status(200).json({ message: 'Files uploaded successfully!', files: uploadedFiles });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Fetch uploaded files
exports.getUploadedFiles = async (req, res) => {
    try {
        const uploads = await Upload.find().populate('userId', 'name email'); // Populate user details
        res.status(200).json(uploads);
    } catch (error) {
        console.error('Error fetching uploaded files:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
