const { checkAndUnlockBadges } = require('./badgeController');
const Project = require('../models/project');
const User = require('../models/user');
const NodeCache = require('node-cache');
const Joi = require('joi');
const winston = require('winston');

// Initialize cache (1-hour TTL, 10-min check period)
const projectEvaluationCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/evaluation.log' }),
    ],
});

// Validation schema for project input
const projectValidationSchema = Joi.object({
    projectId: Joi.string().required(),
});

// Enhanced Software Quality Score Calculation
const calculateSoftwareQualityScore = (project) => {
    let score = 0;

    // Code Quality
    score += (project.codeQuality > 90 ? 25 :
              project.codeQuality > 75 ? 20 :
              project.codeQuality > 50 ? 10 : 0);

    // Unit Test Coverage
    score += (project.unitTests > 90 ? 20 :
              project.unitTests > 75 ? 15 :
              project.unitTests > 50 ? 10 : 0);

    // Performance Metrics
    const { executionTime, memoryUsage } = project.performanceMetrics || {};
    score += executionTime < 100 && memoryUsage < 50 ? 15 : 0;

    // Architecture Best Practices
    score += project.architectureBestPracticesAdhered ? 15 : 5;

    // Task Completion
    const completedTasks = project.tasks.filter((t) => t.completed).length;
    const totalTasks = project.tasks.length;
    score += totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 15;

    // Collaboration
    score += project.gitMetrics.codeReviews > 10 ? 10 : 5;

    // Code Documentation
    score += project.documentationQuality === 'high' ? 10 : 
             project.documentationQuality === 'medium' ? 5 : 0;

    // Ensure score does not exceed 100
    return Math.min(score, 100);
};

// Enhanced Fintech Quality Score Calculation with Dynamic Weights
const calculateDynamicFintechScore = (project) => {
    // Default weights
    let weights = {
        compliance: 0.4,
        security: 0.3,
        transactionEfficiency: 0.15,
        scalability: 0.1,
        innovation: 0.05,
    };

    // Adjust weights dynamically based on project characteristics
    if (project.size === 'small') {
        weights.innovation += 0.1;
        weights.scalability += 0.05;
        weights.compliance -= 0.1;
    } else if (project.size === 'large') {
        weights.compliance += 0.1;
        weights.security += 0.05;
        weights.innovation -= 0.05;
    }

    if (project.market === 'global') {
        weights.scalability += 0.1;
        weights.transactionEfficiency -= 0.05;
    } else if (project.market === 'local') {
        weights.transactionEfficiency += 0.05;
        weights.scalability -= 0.05;
    }

    if (project.lifecycle === 'MVP') {
        weights.innovation += 0.1;
        weights.compliance -= 0.1;
    } else if (project.lifecycle === 'production') {
        weights.compliance += 0.1;
        weights.security += 0.1;
        weights.innovation -= 0.05;
    }

    // Calculate scores
    let score = 0;

    // Compliance (weighted)
    score += weights.compliance * (project.regulatoryCompliance ? 30 : 0);
    score += weights.compliance * (project.antiFraudMechanisms ? 10 : 0);

    // Security Standards (weighted)
    score += weights.security * (project.securityStandardsMet ? 20 : 0);
    score += weights.security * (project.vulnerabilities.length === 0 ? 10 : -10);

    // Transaction Efficiency (weighted)
    if (project.transactionMetrics) {
        const { avgProcessingTime, avgCostPerTransaction } = project.transactionMetrics;
        score += weights.transactionEfficiency *
            (avgProcessingTime <= 1000 ? 10 : avgProcessingTime <= 300 ? 5 : 0);
        score += weights.transactionEfficiency *
            (avgCostPerTransaction <= 0.1 ? 5 : avgCostPerTransaction <= 0.5 ? 2 : 0);
    }

    // Scalability (weighted)
    score += weights.scalability * (project.handlesPeakLoad ? 10 : 0);

    // Innovation and Features (weighted)
    score += weights.innovation * (project.hasAIIntegration ? 5 : 0);
    score += weights.innovation * (project.supportsMultipleCurrencies ? 5 : 0);

    // Ensure score does not exceed 100
    return Math.min(score, 100);
};

// General quality score calculator
const calculateQualityScore = (project) => {
    switch (project.industry) {
        case 'Software':
            return calculateSoftwareQualityScore(project);
        case 'Fintech':
            return calculateDynamicFintechScore(project);
        case 'AI':
            return (
                (project.modelAccuracy > 85 ? 60 : 0) +
                (project.datasetSize > 10000 ? 40 : 0)
            );
        default:
            return 0; // Default case if no industry match
    }
};

// Evaluate project controller
exports.evaluateProject = async (project) => {
    const projectId = project._id; // Get projectId from the project object

    // Validate input
    const { error } = projectValidationSchema.validate({ projectId });
    if (error) {
        throw new Error('Invalid input'); // Throw an error to be caught in submitProject
    }

    try {
        const startTime = Date.now();

        // Check cache for project evaluation
        const cachedResult = projectEvaluationCache.get(projectId);
        if (cachedResult) {
            logger.info('Cache hit for project evaluation', { projectId });
            return cachedResult; // Return cached result
        }

        // Fetch project
        const fetchedProject = await Project.findById(projectId);
        if (!fetchedProject) {
            logger.warn('Project not found', { projectId });
            throw new Error('Project not found'); // Throw an error to be caught in submitProject
        }

        // Calculate quality score
        const qualityScore = calculateQualityScore(fetchedProject);

        // Update project with the quality score
        fetchedProject.qualityScore = qualityScore;
        await fetchedProject.save();

        // Fetch and update user
        const user = await User.findById(fetchedProject.userId);
        if (user) {
            user.points += qualityScore;
            await user.save();

            // Check and unlock badges
            await checkAndUnlockBadges(user._id);
        }

        // Log evaluation process
        const evaluationResult = {
            message: 'Project evaluated successfully',
            qualityScore,
            userPoints: user ? user.points : 0,
        };

        logger.info('Project evaluation completed', {
            projectId,
            qualityScore,
            userId: fetchedProject.userId,
            processingTime: Date.now() - startTime,
        });

        // Store in cache
        projectEvaluationCache.set(projectId, evaluationResult);

        return evaluationResult; // Return the evaluation result
    } catch (error) {
        logger.error('Error evaluating project', {
            projectId,
            error: error.message,
            stack: error.stack,
        });
        throw new Error('Error evaluating project'); // Throw an error to be caught in submitProject
    }
};