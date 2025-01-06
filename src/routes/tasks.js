const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { logger } = require('../utils/logger');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.session.user.id,
      status: { $ne: 'deleted' }
    }).sort({ createdAt: -1 });

    res.render('tasks/index', { 
      tasks,
      user: req.session.user,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    req.flash('error', 'Error loading tasks');
    res.redirect('/');
  }
});

router.post('/', [
  body('title').trim().notEmpty(),
  body('description').trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', 'Invalid input');
      return res.redirect('/tasks');
    }

    const { title, description } = req.body;
    await Task.create({
      userId: req.session.user.id,
      title,
      description
    });

    req.flash('success', 'Task created successfully');
    res.redirect('/tasks');
  } catch (error) {
    logger.error('Error creating task:', error);
    req.flash('error', 'Error creating task');
    res.redirect('/tasks');
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await Task.findOneAndUpdate(
      { _id: id, userId: req.session.user.id },
      { status }
    );

    res.json({ success: true });
  } catch (error) {
    logger.error('Error updating task:', error);
    res.status(500).json({ error: 'Error updating task' });
  }
});

module.exports = router;