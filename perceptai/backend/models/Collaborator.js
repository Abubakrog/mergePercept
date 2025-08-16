const mongoose = require('mongoose');

const collaboratorSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    trim: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  projectDescription: {
    type: String,
    required: true,
    trim: true
  },
  projectCategory: {
    type: String,
    required: true,
    enum: ['Computer Vision', 'AI/ML', 'Web Development', 'Mobile App', 'Data Science', 'Other']
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  projectOwner: {
    type: String,
    required: true,
    trim: true
  },
  projectOwnerId: {
    type: String,
    trim: true
  },
  projectOwnerEmail: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'closed'],
    default: 'open'
  },
  applicants: [{
    userId: String,
    userName: String,
    userEmail: String,
    skills: [String],
    experience: String,
    motivation: String,
    portfolio: String,
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  maxCollaborators: {
    type: Number,
    default: 5
  },
  currentCollaborators: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date
  },
  budget: {
    type: String,
    trim: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true
  },
  remote: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
collaboratorSchema.index({ projectId: 1, status: 1, projectCategory: 1 });

module.exports = mongoose.model('Collaborator', collaboratorSchema);

