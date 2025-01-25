const express = require('express');
const { registerUser, loginUser, logoutUser, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

console.log('registerUser:', registerUser);
console.log('loginUser:', loginUser);
console.log('logoutUser:', logoutUser);
console.log('refreshToken:', refreshToken);
console.log('protect middleware:', protect);

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);

// Route for refreshing the token
router.post('/refresh', refreshToken);

module.exports = router;
