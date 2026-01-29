const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendContactEmail } = require('../config/email');
const { contactLimiter } = require('../middleware/rateLimiter');
const { contactValidationRules, validateRequest } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public (rate limited)
 */
router.post(
  '/',
  contactLimiter,
  contactValidationRules,
  validateRequest,
  async (req, res, next) => {
    try {
      const { name, email, organization, message } = req.body;

      // Create contact document
      const contactData = {
        name,
        email,
        organization: organization || null,
        message,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
      };

      const contact = new Contact(contactData);

      // Save to database
      await contact.save();
      console.log('✅ Contact saved to database:', contact._id);

      // Send email notification
      try {
        await sendContactEmail({
          name,
          email,
          organization,
          message,
        });
        
        // Update contact to mark email as sent
        contact.emailSent = true;
        await contact.save();
        
        console.log('✅ Email sent successfully');
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError.message);
        
        // Update contact with error info
        contact.emailError = emailError.message;
        await contact.save();
        
        // Still return success to user since message was saved
        // You'll be notified of the error in logs and can follow up
      }

      res.status(200).json({
        success: true,
        message: 'Thank you for your message! I\'ll get back to you soon.',
        data: {
          id: contact._id,
          timestamp: contact.createdAt,
        },
      });

    } catch (error) {
      console.error('❌ Contact form error:', error);
      next(error);
    }
  }
);

/**
 * @route   GET /api/contact/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Contact API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
