const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize, users } = require('../middleware/auth');

const router = express.Router();

// GET /api/students/me - Get current student profile
router.get('/me', authenticate, authorize('student'), (req, res) => {
  try {
    const user = users.get(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: user.studentProfile
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /api/students/me - Update student profile
router.patch('/me', authenticate, authorize('student'), [
  body('learningGoals').optional().trim(),
  body('subjects').optional().isArray().withMessage('Subjects must be an array'),
  body('preferredLanguage').optional().trim()
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
        error: 'Student not found'
      });
    }

    const {
      gradeLevel,
      subjectsNeeded,
      learningMode,
      availability
    } = req.body;

    // Update student profile
    const updatedProfile = {
      ...user.studentProfile,
      ...(gradeLevel && { gradeLevel }),
      ...(subjectsNeeded && { subjectsNeeded }),
      ...(learningMode && { learningMode }),
      ...(availability && { availability })
    };

    const updatedUser = {
      ...user,
      studentProfile: updatedProfile,
      updatedAt: new Date().toISOString()
    };

    users.set(user.id, updatedUser);

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Student profile updated successfully'
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;