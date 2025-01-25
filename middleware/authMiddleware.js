const jwt = require('jsonwebtoken');
const User = require('../models/user');
const protect = async (req, res, next) => {
    console.log('Protect middleware triggered:', req.headers); // Log headers for debugging

    if (req.path.startsWith('/assets') || req.path === '/company.js') {
        return next();
    }

    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decoded.id };

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User  not found.' });
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error); // Log error for debugging
        return res.status(401).json({ message: 'Invalid token.' });
    }
};


const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
};

module.exports = { protect, isAdmin };
