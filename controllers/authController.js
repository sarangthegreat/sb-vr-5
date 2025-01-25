const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration
exports.registerUser = async (req, res) => {
    const { name, email, phone, password } = req.body;
    console.log('Registration attempt with email:', email);

    // Basic validation
    if (!name || !email || !phone || !password) {
        console.log('Validation failed: missing fields');
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists');
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ name, email, phone, password: hashedPassword });
        await newUser.save();
        console.log('User registered successfully:', newUser._id);

        // Generate JWT token upon successful registration
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Token generated with expiration:', new Date(Date.now() + 3600000));

        res.status(201).json({
            message: 'User registered successfully',
            token,
        });
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// User Login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt with email:', email);

    if (!email || !password) {
        console.log('Validation failed: missing fields');
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Login successful, token generated');
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            message: 'Login successful',
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// User Logout
exports.logoutUser = async (req, res) => {
    const { userId } = req;
    console.log('User logged out:', userId);

    await User.findByIdAndUpdate(userId, { refreshToken: null });

    res.status(200).json({ message: 'Logout successful' });
};

// Refresh Token Logic
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    console.log('Refresh token attempt');

    if (!refreshToken) {
        console.log('Validation failed: refresh token missing');
        return res.status(401).json({ message: 'Refresh Token is required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        console.log('Decoded refresh token:', decoded);

        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            console.log('Invalid refresh token');
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Generate new access token
        const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('New access token generated with expiration:', new Date(Date.now() + 3600000));

        res.status(200).json({
            message: 'Token refreshed successfully',
            token: newToken,
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('Refresh token has expired:', error);
            return res.status(401).json({ message: 'Refresh token has expired. Please log in again.' });
        }
        console.error('Error during refresh token:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
