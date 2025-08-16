const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Computer Vision', 'AI/ML', 'Web Development', 'Mobile App', 'Data Science', 'Other']
  },
  technologies: [{
    type: String,
    trim: true
  }],
  githubUrl: {
    type: String,
    trim: true
  },
  liveUrl: {
    type: String,
    trim: true
  },
  demoUrl: {
    type: String,
    trim: true
  },
  codeUrl: {
    type: String,
    trim: true
  },
  codeLink: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  thumbnail: {
    type: String,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  authorId: {
    type: String,
    trim: true
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  estimatedTime: {
    type: String,
    trim: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  instructions: {
    type: String,
    trim: true
  },
  executable: {
    type: Boolean,
    default: false
  },
  pythonPath: {
    type: String,
    trim: true
  },
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
projectSchema.index({ name: 1, category: 1, featured: 1 });

module.exports = mongoose.model('Project', projectSchema);

