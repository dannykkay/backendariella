require('dotenv').config();
const express = require('express');
const path = require('path');
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
// Trust Proxy Configuration
// ========================================
app.set('trust proxy', 1); // Trust first proxy

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
  contentSecurityPolicy: false, // Disable CSP for serving HTML/CSS/JS
  crossOriginEmbedderPolicy: false,
}));

// ========================================
// CORS Configuration - SIMPLIFIED
// ========================================
// Since frontend and backend are now same-origin, we can simplify CORS
// This allows same-origin requests + any API testing tools
app.use(cors({
  origin: true, // Allow all origins (you can restrict this if needed)
  credentials: true,
  optionsSuccessStatus: 200,
}));

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
// Serve Static Files (Frontend)
// ========================================
// This serves all files in the 'public' folder (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

console.log('📁 Static files served from:', path.join(__dirname, 'public'));

// ========================================
// API Routes
// ========================================

// Test email endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const result = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: process.env.EMAIL_TO,
      subject: 'Test Email from Render',
      html: '<p>This is a test email to verify Resend works on Render!</p>',
    });
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error 
    });
  }
});

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

// API info endpoint (optional - for testing)
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Damilola Oyedeji Portfolio API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      contactHealth: 'GET /api/contact/health',
      submitContact: 'POST /api/contact',
      testEmail: 'GET /api/test-email',
    },
  });
});

// ========================================
// Fallback Route - Serve index.html
// ========================================
// This catches all non-API routes and serves the frontend
// IMPORTANT: This must come AFTER all API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========================================
// Error Handling
// ========================================
// Note: These are only for API errors, not for serving HTML
app.use(notFound);
app.use(errorHandler);

// ========================================
// Start Server
// ========================================
const server = app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 Portfolio Website + API');
  console.log('========================================');
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log('');
  console.log('📄 Frontend: Serving from /public folder');
  console.log('🔌 API: Available at /api/*');
  console.log('========================================');
});

// ========================================
// Server Timeout Configuration
// ========================================
// Set timeout to 2 minutes (120000ms) to handle slow external API calls
server.timeout = 120000;
server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;

// ========================================
// Process Error Handling
// ========================================
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
