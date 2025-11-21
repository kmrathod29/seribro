// server.js - Seribro Backend Server (Phase 2.1)

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./backend/config/dbconection');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// CORS Configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser Middleware
app.use(cookieParser());

// Static folder for temporary uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const studentProfileRoutes = require('./backend/routes/studentProfileRoute'); // Fixed typo
const authRoutes = require('./backend/routes/authRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentProfileRoutes);

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running fine!' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.error('Error Stack:', err.stack);
    res.status(statusCode).json({
        success: false,
        message: err.message,
        // Show stack trace in development only
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});