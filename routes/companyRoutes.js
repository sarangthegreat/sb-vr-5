const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Define route for fetching projects associated with a company
// The companyId is passed as a route parameter, and the projectId is passed as a query parameter
router.get('/projects', companyController.getCompanyProjects); // No path parameter, just query parameters

module.exports = router;
