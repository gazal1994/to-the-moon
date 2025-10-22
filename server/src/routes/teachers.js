const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize, users } = require('../middleware/auth');

const router = express.Router();

// GET /api/teachers/me - Get current teacher profile
router.get('/me', authenticate, authorize('teacher'), (req, res) => {
  try {
    const user = users.get(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      data: user.teacherProfile
    });
  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /api/teachers/me - Update teacher profile
router.patch('/me', authenticate, authorize('teacher'), [
  body('subjects').optional().isArray().withMessage('Subjects must be an array'),
  body('languages').optional().isArray().withMessage('Languages must be an array'),
  body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('experience').optional().trim(),
  body('education').optional().trim(),
  body('bio').optional().trim(),
  body('availability').optional().isArray().withMessage('Availability must be an array'),
  body('isVolunteer').optional().isBoolean().withMessage('isVolunteer must be a boolean')
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
        error: 'Teacher not found'
      });
    }

    const {
      subjects,
      levels,
      yearsOfExperience,
      certifications,
      hourlyRate,
      isVolunteer,
      maxStudentsPerSession,
      learningMode,
      availability
    } = req.body;

    // Update teacher profile
    const updatedProfile = {
      ...user.teacherProfile,
      ...(subjects && { subjects }),
      ...(levels && { levels }),
      ...(yearsOfExperience !== undefined && { yearsOfExperience }),
      ...(certifications && { certifications }),
      ...(hourlyRate !== undefined && { hourlyRate }),
      ...(isVolunteer !== undefined && { isVolunteer }),
      ...(maxStudentsPerSession !== undefined && { maxStudentsPerSession }),
      ...(learningMode && { learningMode }),
      ...(availability && { availability })
    };

    const updatedUser = {
      ...user,
      teacherProfile: updatedProfile,
      updatedAt: new Date().toISOString()
    };

    users.set(user.id, updatedUser);

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Teacher profile updated successfully'
    });
  } catch (error) {
    console.error('Update teacher profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/teachers - Get all teachers (public endpoint)
router.get('/', (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      subject,
      city,
      country,
      isVolunteer,
      priceMax
    } = req.query;

    // Get all teachers
    let teachers = Array.from(users.values()).filter(user => user.role === 'teacher');

    // Apply filters
    if (subject) {
      teachers = teachers.filter(t => t.teacherProfile?.subjects.includes(subject));
    }
    if (city) {
      teachers = teachers.filter(t => t.location?.city?.toLowerCase().includes(city.toLowerCase()));
    }
    if (country) {
      teachers = teachers.filter(t => t.location?.country?.toLowerCase().includes(country.toLowerCase()));
    }
    if (isVolunteer === 'true') {
      teachers = teachers.filter(t => t.teacherProfile?.isVolunteer);
    }
    if (priceMax) {
      teachers = teachers.filter(t => (t.teacherProfile?.hourlyRate || 0) <= parseFloat(priceMax));
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedTeachers = teachers.slice(startIndex, endIndex);
    
    // Remove sensitive data from response
    const teachersResponse = paginatedTeachers.map(({ password, ...teacher }) => ({
      ...teacher,
      // Add mock rating if not present
      teacherProfile: {
        ...teacher.teacherProfile,
        ratingAvg: teacher.teacherProfile?.ratingAvg || Math.floor(Math.random() * 2) + 4, // 4-5 stars
        ratingCount: teacher.teacherProfile?.ratingCount || Math.floor(Math.random() * 50)
      }
    }));

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
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/teachers/:id - Get teacher by ID
router.get('/:id', (req, res) => {
  try {
    const teacher = users.get(req.params.id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    const { password, ...teacherResponse } = teacher;
    res.json({
      success: true,
      data: {
        ...teacherResponse,
        teacherProfile: {
          ...teacherResponse.teacherProfile,
          ratingAvg: teacherResponse.teacherProfile?.ratingAvg || Math.floor(Math.random() * 2) + 4,
          ratingCount: teacherResponse.teacherProfile?.ratingCount || Math.floor(Math.random() * 50)
        }
      }
    });
  } catch (error) {
    console.error('Get teacher by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;