const mongoose = require('mongoose');
const Project = require('../models/project');
const Company = require('../models/company');

exports.getProjects = async (req, res) => {
    const searchQuery = req.query.search || '';
    try {
        const companyId = req.query.companyId; // Get companyId from query parameters
        
        // Validate companyId format
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            console.error(`Invalid companyId: ${companyId}`);
            return res.status(400).json({ message: 'Invalid company ID format' });
        }

        const projects = await Project.find({
            $or: [
                { 'companyName': { $regex: searchQuery, $options: 'i' } },
                { 'description': { $regex: searchQuery, $options: 'i' } }
            ]
        }).lean(); // lean() for plain JS objects
        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCompanies = async (req, res) => {
    try {
        const companies = await Company.find().lean(); // Fetch all companies
        res.status(200).json(companies);
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
