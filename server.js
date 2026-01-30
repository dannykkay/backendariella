require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const { verifyEmailConfig } = require('./config/email');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const contactRoutes = require('./routes/contact');

// Initialize Express app
const app = express();

// ========================================
// Environment Configuration
// ========================================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ========================================
// Database Connection
// ========================================
connectDB();

// ========================================
// Verify Email Configuration
// ========================================
verifyEmailConfig();

// ========================================
// Security Middleware
// ========================================
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false,
}));

// ========================================
// CORS Configuration
// ========================================
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'https://ariellatest.onrender.com'
      // Add your production frontend URL here
    ].filter(Boolean);

    if (allowedOrigins.includes(origin) || NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ========================================
// Body Parser Middleware
// ========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// Request Logging (Development)
// ========================================
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ========================================
// API Routes
// ========================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Portfolio API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// Contact routes (with rate limiting)
app.use('/api/contact', contactRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Damilola Oyedeji Portfolio API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      contactHealth: 'GET /api/contact/health',
      submitContact: 'POST /api/contact',
    },
  });
});

// ========================================
// Error Handling
// ========================================
app.use(notFound);
app.use(errorHandler);

// ========================================
// Start Server
// ========================================
const server = app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 Portfolio Contact API');
  console.log('========================================');
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log('========================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('🔒 Server closed');
    process.exit(0);
  });
});

module.exports = app;
