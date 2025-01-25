const QA = require('../models/qa');

/**
 * Submit a question for a project
 */
exports.submitQuestion = async (req, res) => {
    try {
        const { projectId, question } = req.body;

        // Validate input
        if (!projectId || !question) {
            return res.status(400).json({ message: 'Project ID and question are required' });
        }

        // Create a new question entry
        const newQuestion = new QA({
            projectId,
            userId: req.user._id, // Assuming user is authenticated and available in req.user
            question
        });

        // Save the question to the database
        await newQuestion.save();

        res.status(201).json({
            message: 'Question submitted successfully',
            questionId: newQuestion._id
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error submitting question',
            error: error.message
        });
    }
};

/**
 * Get all Q&A for a project
 */
exports.getProjectQA = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Validate input
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        // Fetch all questions for the project
        const qaEntries = await QA.find({ projectId }).populate('userId', 'name');

        if (!qaEntries.length) {
            return res.status(404).json({ message: 'No questions found for this project' });
        }

        res.status(200).json({ qa: qaEntries });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching Q&A for the project',
            error: error.message
        });
    }
};

/**
 * Answer a question manually
 */
exports.answerQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { answer } = req.body;

        // Validate input
        if (!answer) {
            return res.status(400).json({ message: 'Answer is required' });
        }

        // Find the question and update it with the answer
        const qaEntry = await QA.findByIdAndUpdate(
            questionId,
            { answer, answeredAt: Date.now() },
            { new: true }
        );

        if (!qaEntry) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json({
            message: 'Answer added successfully',
            qaEntry
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error answering the question',
            error: error.message
        });
    }
};

/**
 * Generate an answer for a question (you can replace this with your logic)
 */
exports.generateAnswer = async (req, res) => {
    try {
        const { questionId } = req.params;

        // Find the question in the database
        const question = await QA.findById(questionId);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // You can add your logic to generate an answer here, e.g., using an API or a simple placeholder
        const answer = `Generated answer for: ${question.question}`;

        res.status(200).json({
            message: 'Answer generated successfully',
            answer
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error generating the answer',
            error: error.message
        });
    }
};
