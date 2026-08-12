const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// Create feedback
router.post('/', async (req, res, next) => {
  try {
    const { name, mobile, email, service, rating, feedback } = req.body;
    // Basic validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name is required and must be at least 2 characters' });
    }
    const mobileClean = String(mobile || '').replace(/\D/g, '');
    if (!mobileClean || mobileClean.length !== 10) {
      return res.status(400).json({ error: 'Mobile must be a valid 10-digit number' });
    }
    if (!service || String(service).trim().length < 2) {
      return res.status(400).json({ error: 'Service is required' });
    }
    const r = Number(rating);
    if (isNaN(r) || r < 1 || r > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }
    if (!feedback || String(feedback).trim().length < 10) {
      return res.status(400).json({ error: 'Feedback must be at least 10 characters' });
    }

    const fb = new Feedback({
      name: name.trim(),
      mobile: mobileClean,
      email: email ? String(email).trim() : '',
      service: String(service).trim(),
      rating: r,
      feedback: String(feedback).trim()
    });

    const saved = await fb.save();
    return res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

// List feedbacks (most recent first)
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 500, 2000);
    const feedbacks = await Feedback.find().sort({ date: -1 }).limit(limit).lean();
    res.json(feedbacks);
  } catch (err) {
    next(err);
  }
});

// Delete all feedbacks (dev helper)
router.delete('/', async (req, res, next) => {
  try {
    await Feedback.deleteMany({});
    res.json({ ok: true, message: 'All feedbacks deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
