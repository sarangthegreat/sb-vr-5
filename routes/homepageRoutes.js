const express = require('express');
const router = express.Router();
const homepageController = require('../controllers/homepageController');

// Define route for fetching companies
router.get('/companies', homepageController.getCompanies); // Ensure this route exists

// This route seems to handle search functionality for projects
router.get('/projects', homepageController.getProjects);  // Correct endpoint for searching projects

module.exports = router;