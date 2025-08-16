const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/resources');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// GET all resources
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, featured, status, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (featured) query.featured = featured === 'true';
    if (status) query.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Resource.countDocuments(query);
    
    res.json({
      resources,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + resources.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// GET resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Increment views
    resource.views += 1;
    await resource.save();
    
    res.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// POST new resource
router.post('/', upload.single('thumbnail'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      url,
      author,
      authorId,
      tags,
      difficulty,
      estimatedTime,
      language
    } = req.body;

    const resourceData = {
      title,
      description,
      category,
      url,
      author,
      authorId,
      tags: tags ? JSON.parse(tags) : [],
      difficulty,
      estimatedTime,
      language
    };

    if (req.file) {
      resourceData.thumbnail = `/uploads/resources/${req.file.filename}`;
    }

    const resource = new Resource(resourceData);
    await resource.save();

    res.status(201).json(resource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// PUT update resource
router.put('/:id', upload.single('thumbnail'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const updateData = { ...req.body };
    
    // Handle array fields
    if (req.body.tags) {
      updateData.tags = JSON.parse(req.body.tags);
    }

    if (req.file) {
      updateData.thumbnail = `/uploads/resources/${req.file.filename}`;
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedResource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// DELETE resource
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Delete associated thumbnail if exists
    if (resource.thumbnail) {
      const thumbnailPath = path.join(__dirname, '..', resource.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// POST add review to resource
router.post('/:id/review', async (req, res) => {
  try {
    const { userId, userName, rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check if user already reviewed
    const existingReview = resource.reviews.find(review => review.userId === userId);
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this resource' });
    }

    // Add review
    resource.reviews.push({
      userId,
      userName,
      rating: parseInt(rating),
      comment
    });

    // Update average rating
    const totalRating = resource.reviews.reduce((sum, review) => sum + review.rating, 0);
    resource.rating = totalRating / resource.reviews.length;

    await resource.save();

    res.json({ 
      message: 'Review added successfully',
      rating: resource.rating,
      totalReviews: resource.reviews.length
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// GET featured resources
router.get('/featured/list', async (req, res) => {
  try {
    const featuredResources = await Resource.find({ featured: true, status: 'active' })
      .sort({ rating: -1, views: -1 })
      .limit(10);
    
    res.json(featuredResources);
  } catch (error) {
    console.error('Error fetching featured resources:', error);
    res.status(500).json({ error: 'Failed to fetch featured resources' });
  }
});

// GET resources by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const resources = await Resource.find({ 
      category, 
      status: 'active' 
    })
    .sort({ rating: -1, views: -1 })
    .limit(parseInt(limit))
    .skip(skip);
    
    const total = await Resource.countDocuments({ category, status: 'active' });
    
    res.json({
      resources,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + resources.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching resources by category:', error);
    res.status(500).json({ error: 'Failed to fetch resources by category' });
  }
});

module.exports = router;




