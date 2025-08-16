const express = require('express');
const router = express.Router();
const Collaborator = require('../models/Collaborator');

// GET all collaboration projects
router.get('/', async (req, res) => {
  try {
    const { status, category, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (category) query.projectCategory = category;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const collaborators = await Collaborator.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Collaborator.countDocuments(query);
    
    res.json({
      collaborators,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + collaborators.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ error: 'Failed to fetch collaboration projects' });
  }
});

// GET collaboration project by ID
router.get('/:id', async (req, res) => {
  try {
    const collaborator = await Collaborator.findById(req.params.id);
    if (!collaborator) {
      return res.status(404).json({ error: 'Collaboration project not found' });
    }
    
    res.json(collaborator);
  } catch (error) {
    console.error('Error fetching collaboration project:', error);
    res.status(500).json({ error: 'Failed to fetch collaboration project' });
  }
});

// POST new collaboration project
router.post('/', async (req, res) => {
  try {
    const {
      projectId,
      projectName,
      projectDescription,
      projectCategory,
      requiredSkills,
      projectOwner,
      projectOwnerId,
      projectOwnerEmail,
      maxCollaborators,
      deadline,
      budget,
      isPaid,
      location,
      remote,
      tags
    } = req.body;

    const collaboratorData = {
      projectId,
      projectName,
      projectDescription,
      projectCategory,
      requiredSkills: requiredSkills ? JSON.parse(requiredSkills) : [],
      projectOwner,
      projectOwnerId,
      projectOwnerEmail,
      maxCollaborators: maxCollaborators || 5,
      deadline,
      budget,
      isPaid: isPaid === 'true',
      location,
      remote: remote !== 'false',
      tags: tags ? JSON.parse(tags) : []
    };

    const collaborator = new Collaborator(collaboratorData);
    await collaborator.save();

    res.status(201).json(collaborator);
  } catch (error) {
    console.error('Error creating collaboration project:', error);
    res.status(500).json({ error: 'Failed to create collaboration project' });
  }
});

// PUT update collaboration project
router.put('/:id', async (req, res) => {
  try {
    const collaborator = await Collaborator.findById(req.params.id);
    if (!collaborator) {
      return res.status(404).json({ error: 'Collaboration project not found' });
    }

    const updateData = { ...req.body };
    
    // Handle array fields
    if (req.body.requiredSkills) {
      updateData.requiredSkills = JSON.parse(req.body.requiredSkills);
    }
    if (req.body.tags) {
      updateData.tags = JSON.parse(req.body.tags);
    }

    const updatedCollaborator = await Collaborator.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedCollaborator);
  } catch (error) {
    console.error('Error updating collaboration project:', error);
    res.status(500).json({ error: 'Failed to update collaboration project' });
  }
});

// DELETE collaboration project
router.delete('/:id', async (req, res) => {
  try {
    const collaborator = await Collaborator.findByIdAndDelete(req.params.id);
    if (!collaborator) {
      return res.status(404).json({ error: 'Collaboration project not found' });
    }

    res.json({ message: 'Collaboration project deleted successfully' });
  } catch (error) {
    console.error('Error deleting collaboration project:', error);
    res.status(500).json({ error: 'Failed to delete collaboration project' });
  }
});

// POST apply to collaboration project
router.post('/:id/apply', async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      skills,
      experience,
      motivation,
      portfolio
    } = req.body;

    const collaborator = await Collaborator.findById(req.params.id);
    if (!collaborator) {
      return res.status(404).json({ error: 'Collaboration project not found' });
    }

    // Check if project is still open
    if (collaborator.status !== 'open') {
      return res.status(400).json({ error: 'This project is no longer accepting applications' });
    }

    // Check if user already applied
    const existingApplication = collaborator.applicants.find(app => app.userId === userId);
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this project' });
    }

    // Check if project is full
    if (collaborator.currentCollaborators >= collaborator.maxCollaborators) {
      return res.status(400).json({ error: 'This project has reached maximum collaborators' });
    }

    // Add application
    collaborator.applicants.push({
      userId,
      userName,
      userEmail,
      skills: skills ? JSON.parse(skills) : [],
      experience,
      motivation,
      portfolio,
      status: 'pending'
    });

    await collaborator.save();

    res.json({ 
      message: 'Application submitted successfully',
      applicationId: collaborator.applicants[collaborator.applicants.length - 1]._id
    });
  } catch (error) {
    console.error('Error applying to collaboration project:', error);
    res.status(500).json({ error: 'Failed to apply to collaboration project' });
  }
});

// PUT update application status
router.put('/:id/applications/:applicationId', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const collaborator = await Collaborator.findById(req.params.id);
    if (!collaborator) {
      return res.status(404).json({ error: 'Collaboration project not found' });
    }

    const application = collaborator.applicants.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update application status
    application.status = status;

    // If accepted, increment current collaborators
    if (status === 'accepted' && application.status !== 'accepted') {
      collaborator.currentCollaborators += 1;
      
      // If project is full, close it
      if (collaborator.currentCollaborators >= collaborator.maxCollaborators) {
        collaborator.status = 'in-progress';
      }
    }

    await collaborator.save();

    res.json({ 
      message: 'Application status updated successfully',
      status: application.status
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// GET open collaboration projects
router.get('/open/list', async (req, res) => {
  try {
    const openProjects = await Collaborator.find({ 
      status: 'open' 
    })
    .sort({ createdAt: -1 })
    .limit(20);
    
    res.json(openProjects);
  } catch (error) {
    console.error('Error fetching open collaboration projects:', error);
    res.status(500).json({ error: 'Failed to fetch open collaboration projects' });
  }
});

// GET collaboration projects by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const collaborators = await Collaborator.find({ 
      projectCategory: category,
      status: { $in: ['open', 'in-progress'] }
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
    
    const total = await Collaborator.countDocuments({ 
      projectCategory: category,
      status: { $in: ['open', 'in-progress'] }
    });
    
    res.json({
      collaborators,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + collaborators.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching collaboration projects by category:', error);
    res.status(500).json({ error: 'Failed to fetch collaboration projects by category' });
  }
});

module.exports = router;




