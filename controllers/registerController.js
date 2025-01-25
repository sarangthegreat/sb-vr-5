const User = require('../models/user');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
    const { name, email, phone, password } = req.body;

    // Basic validation
    if (!name || !email || !phone || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            isVerified: false,
            points: 0, // Initialize points
            badges: [], // Initialize badges
            completedProjects: [] // Initialize completed projects
        });

        await newUser.save();

        // Send verification email (basic example, set up nodemailer properly)
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Replace with your email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your email',
            text: 'Please verify your email by clicking on the link.'
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'User registered successfully. Please check your email to verify.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
