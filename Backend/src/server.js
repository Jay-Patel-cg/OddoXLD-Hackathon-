const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json());

// Mount Base API Routes -> /api
app.use('/api', apiRoutes);

// Root route redirect/info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Musafir Buddy API Backend. Access endpoints at /api/health'
  });
});

// Centralized Central Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start Server after MongoDB connection
 */
const startServer = async () => {
  try {
    console.log('[Server] Connecting to MongoDB...');
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`[Server] Musafir Buddy Backend server running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Server] Health Check available at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(`[Server Startup Error] Failed to start server due to database connection error: ${error.message}`);
    console.error(`[Server Startup Info] Please ensure MONGODB_URI in your .env file contains valid MongoDB credentials.`);
    
    // In development mode, if local MongoDB is not running, start server in fallback mode so health check can still be verified.
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Server Warning] Starting Express server in DB-fallback mode for API testing...`);
      app.listen(PORT, () => {
        console.log(`[Server] Musafir Buddy Backend server running in DB-degraded mode on port ${PORT}`);
        console.log(`[Server] Health Check available at http://localhost:${PORT}/api/health`);
      });
    } else {
      process.exit(1);
    }
  }
};

startServer();

module.exports = app;
