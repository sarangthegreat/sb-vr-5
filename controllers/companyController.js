const mongoose = require('mongoose');
const Project = require('../models/project');

exports.getCompanyProjects = async (req, res) => {
    const { companyId, projectId } = req.query;  // Extract companyId and projectId from query params

    // Log the incoming request details for debugging
    console.log(`Received request for company projects: companyId = ${companyId}, projectId = ${projectId}`);

    // Validate companyId
    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
        console.error(`Invalid company ID format: ${companyId}`);
        return res.status(400).json({ message: 'Invalid company ID' });
    }

    // Validate projectId (if provided)
    if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
        console.error(`Invalid project ID format: ${projectId}`);
        return res.status(400).json({ message: 'Invalid project ID' });
    }

    // Convert to ObjectId for querying
    const companyObjectId = new mongoose.Types.ObjectId(companyId);
    const projectObjectId = projectId ? new mongoose.Types.ObjectId(projectId) : null;

    console.log("Company ID as ObjectId:", companyObjectId);
    console.log("Project ID as ObjectId:", projectObjectId);

    try {
        // Construct the query
        let query = { companyId: companyObjectId };
        if (projectObjectId) {
            query._id = projectObjectId; // Add projectId to the query if provided
        }

        console.log("Constructed query:", query);

        // Fetch projects from the database
        const projects = await Project.find(query).populate('companyId', 'name');

        // Log the number of projects found
        console.log(`Projects found: ${projects.length}`);

        if (!projects || projects.length === 0) {
            console.warn(`No projects found for company ID: ${companyId}`);
            return res.status(404).json({ message: 'No projects found for this company' });
        }

        // Send the response with the project data
        res.status(200).json(projects);
        console.log("Successfully returned projects data");

    } catch (error) {
        // Log any error that occurs during the fetch process
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
