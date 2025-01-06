const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { logger } = require('../utils/logger');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('auth/login', { 
    error: req.flash('error'),
    success: req.flash('success')
  });
});

router.get('/signup', (req, res) => {
  res.render('auth/signup', { 
    error: req.flash('error')
  });
});

router.post('/signup', [
  body('username').trim().isLength({ min: 3 }),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', 'Invalid input');
      return res.redirect('/auth/signup');
    }

    const { username, password } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash('error', 'Username already exists');
      return res.redirect('/auth/signup');
    }

    await User.create({ username, password });

    req.flash('success', 'Account created successfully! Please log in.');
    res.redirect('/auth/login');
  } catch (error) {
    logger.error('Signup error:', error);
    req.flash('error', 'Error creating account');
    res.redirect('/auth/signup');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/auth/login');
    }

    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/auth/login');
    }

    req.session.user = { id: user._id, username: user.username };
    res.redirect('/tasks');
  } catch (error) {
    logger.error('Login error:', error);
    req.flash('error', 'Error logging in');
    res.redirect('/auth/login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

module.exports = router;