const mongoose = require('mongoose');
const validator = require('validator');

/**
 * Contact Message Schema
 * Stores all contact form submissions in MongoDB
 */
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Please provide a valid email address',
    },
  },
  organization: {
    type: String,
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters'],
    default: null,
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters long'],
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  emailError: {
    type: String,
    default: null,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Add indexes for better query performance
contactSchema.index({ createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ emailSent: 1 });

/**
 * Instance method to get a summary of the contact
 */
contactSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    organization: this.organization,
    messagePreview: this.message.substring(0, 50) + (this.message.length > 50 ? '...' : ''),
    emailSent: this.emailSent,
    createdAt: this.createdAt,
  };
};

/**
 * Static method to get recent contacts
 */
contactSchema.statics.getRecent = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-emailError -ipAddress -userAgent');
};

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
