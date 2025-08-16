const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/projects');
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

// GET all projects
router.get('/', async (req, res) => {
  try {
    const { category, featured, status, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (status) query.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Project.countDocuments(query);
    
    res.json({
      projects,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + projects.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Increment views
    project.views += 1;
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST new project
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      category,
      technologies,
      githubUrl,
      liveUrl,
      demoUrl,
      codeUrl,
      author,
      authorId,
      tags,
      difficulty,
      estimatedTime,
      requirements,
      instructions,
      executable,
      pythonPath
    } = req.body;

    // Check if project with same name already exists
    const existingProject = await Project.findOne({ name });
    if (existingProject) {
      return res.status(400).json({ error: 'Project with this name already exists' });
    }

    const projectData = {
      name,
      title,
      description,
      category,
      technologies: technologies ? JSON.parse(technologies) : [],
      githubUrl,
      liveUrl,
      demoUrl,
      codeUrl,
      author,
      authorId,
      tags: tags ? JSON.parse(tags) : [],
      difficulty,
      estimatedTime,
      requirements: requirements ? JSON.parse(requirements) : [],
      instructions,
      executable: executable === 'true',
      pythonPath
    };

    if (req.file) {
      projectData.image = `/uploads/projects/${req.file.filename}`;
    }

    const project = new Project(projectData);
    await project.save();

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT update project
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updateData = { ...req.body };
    
    // Handle array fields
    if (req.body.technologies) {
      updateData.technologies = JSON.parse(req.body.technologies);
    }
    if (req.body.tags) {
      updateData.tags = JSON.parse(req.body.tags);
    }
    if (req.body.requirements) {
      updateData.requirements = JSON.parse(req.body.requirements);
    }

    if (req.file) {
      updateData.image = `/uploads/projects/${req.file.filename}`;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete associated image if exists
    if (project.image) {
      const imagePath = path.join(__dirname, '..', project.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// POST like project
router.post('/:id/like', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.likes += 1;
    await project.save();

    res.json({ likes: project.likes });
  } catch (error) {
    console.error('Error liking project:', error);
    res.status(500).json({ error: 'Failed to like project' });
  }
});

// GET featured projects
router.get('/featured/list', async (req, res) => {
  try {
    const featuredProjects = await Project.find({ featured: true, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json(featuredProjects);
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    res.status(500).json({ error: 'Failed to fetch featured projects' });
  }
});

// GET projects by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const projects = await Project.find({ 
      category, 
      status: 'active' 
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
    
    const total = await Project.countDocuments({ category, status: 'active' });
    
    res.json({
      projects,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + projects.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching projects by category:', error);
    res.status(500).json({ error: 'Failed to fetch projects by category' });
  }
});

module.exports = router;

