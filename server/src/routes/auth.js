const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, TeacherProfile, StudentProfile } = require('../models');

const router = express.Router();

// Generate JWT tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher']).withMessage('Role must be student or teacher')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      role,
      phone: phone || null,
      emailVerified: false,
      phoneVerified: false,
      avatarUrl: null,
      gender: null,
      languages: ['en'],
      bio: null,
      isActive: true
    });

    // Create profile based on role
    if (role === 'teacher') {
      await TeacherProfile.create({
        userId: user.id,
        subjects: [],
        levels: [],
        yearsOfExperience: 0,
        certifications: [],
        hourlyRate: 0,
        isVolunteer: false,
        maxStudentsPerSession: 1,
        learningMode: 'online',
        availability: [],
        ratingAvg: 0,
        ratingCount: 0
      });
    } else {
      await StudentProfile.create({
        userId: user.id,
        gradeLevel: 'secondary',
        subjectsNeeded: [],
        learningMode: 'online',
        availability: []
      });
    }

    // Generate tokens
    const tokenPair = generateTokens(user);

    // Get user with profile for response
    const userWithProfile = await User.findByPk(user.id, {
      include: [
        { model: TeacherProfile, as: 'teacherProfile' },
        { model: StudentProfile, as: 'studentProfile' }
      ]
    });

    // Remove password from response
    const { passwordHash, ...userResponse } = userWithProfile.toJSON();

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        tokens: tokenPair
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user with profiles
    const user = await User.findOne({
      where: { email },
      include: [
        { model: TeacherProfile, as: 'teacherProfile' },
        { model: StudentProfile, as: 'studentProfile' }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate tokens
    const tokenPair = generateTokens(user);

    // Remove password from response
    const { passwordHash, ...userResponse } = user.toJSON();

    res.json({
      success: true,
      data: {
        user: userResponse,
        tokens: tokenPair
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('code').notEmpty().withMessage('Verification code is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, code } = req.body;

    // Find user
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Mock verification (in real app, verify against stored code)
    if (code === '123456') {
      user.emailVerified = true;
      users.set(user.id, user);

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/verify-phone
router.post('/verify-phone', [
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('code').notEmpty().withMessage('Verification code is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { phone, code } = req.body;

    // Find user by phone
    const user = Array.from(users.values()).find(u => u.phone === phone);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Mock verification
    if (code === '123456') {
      user.phoneVerified = true;
      users.set(user.id, user);

      res.json({
        success: true,
        message: 'Phone verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      tokens.delete(token);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { refreshToken } = req.body;

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Find user
    const user = await User.findByPk(decoded.id, {
      include: [
        { model: TeacherProfile, as: 'teacherProfile' },
        { model: StudentProfile, as: 'studentProfile' }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate new tokens
    const tokenPair = generateTokens(user);

    res.json({
      success: true,
      data: {
        tokens: tokenPair
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;