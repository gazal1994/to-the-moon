const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, users } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me - Get current user
router.get('/me', authenticate, (req, res) => {
  try {
    const user = users.get(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { password, ...userResponse } = user;
    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /api/users/me - Update current user
router.patch('/me', authenticate, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('email').optional().isEmail().withMessage('Valid email is required')
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

    const user = users.get(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { name, phone, email } = req.body;
    
    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = Array.from(users.values()).find(u => u.email === email && u.id !== user.id);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already taken'
        });
      }
    }

    // Update user
    const updatedUser = {
      ...user,
      ...(name && { name }),
      ...(phone && { phone }),
      ...(email && { email, emailVerified: email !== user.email ? false : user.emailVerified }),
      updatedAt: new Date().toISOString()
    };

    users.set(user.id, updatedUser);

    const { password, ...userResponse } = updatedUser;
    res.json({
      success: true,
      data: userResponse,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/users/me/avatar - Upload avatar
router.post('/me/avatar', authenticate, (req, res) => {
  try {
    const user = users.get(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Mock avatar upload (in real app, handle file upload with multer)
    const avatarUrl = `https://api.aqra.app/uploads/avatars/${user.id}.jpg`;
    
    const updatedUser = {
      ...user,
      avatarUrl,
      updatedAt: new Date().toISOString()
    };

    users.set(user.id, updatedUser);

    res.json({
      success: true,
      data: { avatarUrl },
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/users/search - Search users (teachers)
router.get('/search', (req, res) => {
  try {
    const {
      subject,
      level,
      city,
      country,
      learningMode,
      language,
      isVolunteer,
      ratingMin,
      availableAt,
      priceMax,
      gender,
      page = 1,
      limit = 20
    } = req.query;

    // Get all teachers
    let teachers = Array.from(users.values()).filter(user => user.role === 'teacher');

    // Apply filters
    if (subject) {
      teachers = teachers.filter(t => t.profile.subjects.includes(subject));
    }
    if (city) {
      teachers = teachers.filter(t => t.profile.city?.toLowerCase().includes(city.toLowerCase()));
    }
    if (country) {
      teachers = teachers.filter(t => t.profile.country?.toLowerCase().includes(country.toLowerCase()));
    }
    if (language) {
      teachers = teachers.filter(t => t.profile.languages.includes(language));
    }
    if (isVolunteer === 'true') {
      teachers = teachers.filter(t => t.profile.isVolunteer);
    }
    if (priceMax) {
      teachers = teachers.filter(t => t.profile.hourlyRate <= parseFloat(priceMax));
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedTeachers = teachers.slice(startIndex, endIndex);
    
    // Remove passwords from response
    const teachersResponse = paginatedTeachers.map(({ password, ...teacher }) => teacher);

    res.json({
      success: true,
      data: {
        data: teachersResponse,
        total: teachers.length,
        page: pageNum,
        limit: limitNum,
        hasMore: endIndex < teachers.length
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  try {
    const user = users.get(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { password, ...userResponse } = user;
    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;