const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const nodemailer = require('nodemailer');

// Configure nodemailer (you'll need to set up your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// GET all newsletter subscribers (admin only)
router.get('/emails', async (req, res) => {
  try {
    const subscribers = await Newsletter.find({})
      .sort({ subscribedAt: -1 })
      .select('email firstName lastName subscribed status subscribedAt');
    
    res.json(subscribers);
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

// POST subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { 
      email, 
      firstName, 
      lastName, 
      source,
      preferences = {
        projects: true,
        tutorials: true,
        news: true,
        events: true
      }
    } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existingSubscriber) {
      if (existingSubscriber.subscribed) {
        return res.status(400).json({ error: 'Email is already subscribed' });
      } else {
        // Resubscribe
        existingSubscriber.subscribed = true;
        existingSubscriber.unsubscribedAt = null;
        existingSubscriber.status = 'active';
        if (firstName) existingSubscriber.firstName = firstName;
        if (lastName) existingSubscriber.lastName = lastName;
        if (preferences) existingSubscriber.preferences = preferences;
        await existingSubscriber.save();
        
        return res.json({ 
          message: 'Successfully resubscribed to newsletter',
          subscriber: existingSubscriber
        });
      }
    }

    // Create new subscriber
    const subscriber = new Newsletter({
      email: email.toLowerCase(),
      firstName,
      lastName,
      source,
      preferences,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await subscriber.save();

    // Send welcome email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to PerceptAI Newsletter!',
        html: `
          <h2>Welcome to PerceptAI!</h2>
          <p>Thank you for subscribing to our newsletter. You'll receive updates about:</p>
          <ul>
            <li>Latest AI/ML projects and tutorials</li>
            <li>Computer vision developments</li>
            <li>Community events and collaborations</li>
            <li>Exclusive learning resources</li>
          </ul>
          <p>Stay tuned for amazing content!</p>
          <p>Best regards,<br>The PerceptAI Team</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    res.status(201).json({ 
      message: 'Successfully subscribed to newsletter',
      subscriber
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ error: 'Failed to subscribe to newsletter' });
  }
});

// POST unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    subscriber.subscribed = false;
    subscriber.unsubscribedAt = new Date();
    subscriber.status = 'unsubscribed';
    await subscriber.save();

    res.json({ message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from newsletter' });
  }
});

// POST send newsletter (admin only)
router.post('/send', async (req, res) => {
  try {
    const { 
      subject, 
      content, 
      type = 'general',
      category = null 
    } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ error: 'Subject and content are required' });
    }

    // Build query based on type and category
    let query = { subscribed: true, status: 'active' };
    
    if (type === 'category' && category) {
      query[`preferences.${category}`] = true;
    }

    const subscribers = await Newsletter.find(query);
    
    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No subscribers found for this criteria' });
    }

    // Send emails to subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: subscriber.email,
          subject: subject,
          html: content
        });

        // Update subscriber stats
        subscriber.lastEmailSent = new Date();
        subscriber.emailCount += 1;
        await subscriber.save();

        return { success: true, email: subscriber.email };
      } catch (error) {
        console.error(`Error sending email to ${subscriber.email}:`, error);
        
        // Update bounce count
        subscriber.bounceCount += 1;
        if (subscriber.bounceCount >= 3) {
          subscriber.status = 'bounced';
        }
        await subscriber.save();

        return { success: false, email: subscriber.email, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      message: `Newsletter sent to ${subscribers.length} subscribers`,
      results: {
        total: subscribers.length,
        successful,
        failed
      },
      details: results
    });

  } catch (error) {
    console.error('Error sending newsletter:', error);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
});

// GET newsletter statistics
router.get('/stats', async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments();
    const activeSubscribers = await Newsletter.countDocuments({ subscribed: true, status: 'active' });
    const unsubscribed = await Newsletter.countDocuments({ subscribed: false });
    const bounced = await Newsletter.countDocuments({ status: 'bounced' });
    
    const recentSubscribers = await Newsletter.find({ subscribed: true })
      .sort({ subscribedAt: -1 })
      .limit(10)
      .select('email firstName lastName subscribedAt');

    res.json({
      totalSubscribers,
      activeSubscribers,
      unsubscribed,
      bounced,
      recentSubscribers
    });
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    res.status(500).json({ error: 'Failed to fetch newsletter statistics' });
  }
});

// PUT update subscriber preferences
router.put('/preferences/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { preferences } = req.body;

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    subscriber.preferences = { ...subscriber.preferences, ...preferences };
    await subscriber.save();

    res.json({ 
      message: 'Preferences updated successfully',
      preferences: subscriber.preferences
    });
  } catch (error) {
    console.error('Error updating subscriber preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// DELETE subscriber (admin only)
router.delete('/subscriber/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const subscriber = await Newsletter.findOneAndDelete({ email: email.toLowerCase() });
    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
});

module.exports = router;
