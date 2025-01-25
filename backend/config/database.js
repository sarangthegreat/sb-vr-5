const mongoose = require('mongoose');

// Enhanced MongoDB connection with detailed debugging
const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log(`Connecting to MongoDB URI: ${process.env.MONGO_URI}`);
        
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB connected successfully.');
    } catch (error) {
        // Detailed logging of the error
        console.error('MongoDB connection error:', error.message);
        console.error('Stack trace:', error.stack);

        // Specific handling for MongoServerError or related cases
        if (error.name === 'MongoServerError') {
            console.error('MongoServerError Code:', error.code);
            if (error.code === 13297) {
                console.error('Database case-sensitivity issue detected. Check the casing of your database name.');
            }
        }

        // Exit the process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
