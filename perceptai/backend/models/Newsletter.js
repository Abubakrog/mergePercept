const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  subscribed: {
    type: Boolean,
    default: true
  },
  preferences: {
    projects: {
      type: Boolean,
      default: true
    },
    tutorials: {
      type: Boolean,
      default: true
    },
    news: {
      type: Boolean,
      default: true
    },
    events: {
      type: Boolean,
      default: true
    }
  },
  source: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  lastEmailSent: {
    type: Date
  },
  emailCount: {
    type: Number,
    default: 0
  },
  bounceCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced', 'spam'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for better query performance
newsletterSchema.index({ email: 1, subscribed: 1, status: 1 });

module.exports = mongoose.model('Newsletter', newsletterSchema);

