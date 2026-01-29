const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for contact form submissions
 * Prevents spam by limiting requests per IP address
 */
const contactLimiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000, // Default: 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // Default: 5 requests per window
  message: {
    success: false,
    error: 'Too many contact form submissions. Please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests from counting against the limit
  skipSuccessfulRequests: false,
  // Skip failed requests from counting against the limit
  skipFailedRequests: false,
});

/**
 * General API rate limiter
 * More lenient than contact form limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  contactLimiter,
  apiLimiter,
};
