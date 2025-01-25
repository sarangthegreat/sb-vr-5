const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const WebSocket = require('ws');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import the protect middleware
const { protect } = require('./middleware/authMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const qaRoutes = require('./routes/qaRoutes');
const registerRoutes = require('./routes/registerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const homepageRoutes = require('./routes/homepageRoutes');
const projectRoutes = require('./routes/projectRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // Import the upload routes

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup to allow only your frontend's URL
const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Add all your frontend origins here
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  // Allow cookies to be sent
};


app.use(cors(corsOptions)); // Apply CORS middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());  // Use cookie-parser middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your_secret',
        resave: false,
        saveUninitialized: true,
    })
);

// Log all incoming requests for debugging
app.use((req, res, next) => {
    console.log(`Received request for: ${req.url}`);
    next();
});

// Serve static files from the assets directory
app.use('/assets', express.static(__dirname + '/assets'));

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/company', protect, companyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/workspace/upload', uploadRoutes); // Add the upload routes here

// Serve the register page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/assets/register.html');
});

// Serve the homepage
app.get('/homepage', (req, res) => {
    res.sendFile(__dirname + '/assets/homepage.html');
});

// Serve company-specific project page
app.get('/company/:id', (req, res) => {
    res.sendFile(__dirname + '/assets/company.html');
});

// Serve other static HTML pages
app.get('/profile', (req, res) => {
    res.sendFile(__dirname + '/assets/profile.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/assets/register.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/assets/login.html');
});

app.get('/notifications', (req, res) => {
    res.sendFile(__dirname + '/assets/notification.html');
});

app.get('/settings', (req, res) => {
    res.sendFile(__dirname + '/assets/setting.html');
});

app.get('/workspace', (req, res) => {
    console.log('Serving workspace.html');
    res.sendFile(__dirname + '/assets/workspace.html');
});

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', ( ws) => {
    console.log('New WebSocket connection established');

    ws.on('message', (message) => {
        console.log('Received message:', message);
        ws.send(`Echo: ${message}`);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    ws.send('Welcome to the WebSocket server!');
});