const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { authenticate } = require('../middleware/auth');
const { User, LessonRequest, TeacherAvailability } = require('../models');
const { notifyTeacherNewRequest, notifyStudentRequestUpdate } = require('../services/redisNotificationService');

const router = express.Router();

// GET /api/requests - Get user's requests
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, teacherId, role } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    // Build where clause based on role filter
    let where = {};
    
    if (role === 'teacher') {
      // Get requests where current user is the teacher (received requests)
      where.teacherId = teacherId || req.user.id;
    } else if (role === 'student') {
      // Get requests where current user is the student (sent requests)
      where.studentId = req.user.id;
    } else {
      // Default: get all requests where user is either student or teacher
      where = {
        [Op.or]: [
          { studentId: req.user.id },
          { teacherId: req.user.id }
        ]
      };
    }
    
    if (status) {
      where.status = status;
    }
    
    // Get requests from database with student and teacher info
    const { count, rows: userRequests } = await LessonRequest.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset: offset
    });
    
    res.json({
      success: true,
      requests: userRequests,
      total: count,
      page: pageNum,
      limit: limitNum,
      hasMore: offset + limitNum < count
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/requests - Create new request
router.post('/', authenticate, [
  body('teacherId').notEmpty().withMessage('Teacher ID is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').optional().trim(),
  body('preferredDate').optional().isISO8601().withMessage('Invalid date format'),
  body('preferredTime').optional().isString().withMessage('Preferred time must be a string'),
  body('preferredMode').optional().isIn(['online', 'in_person']).withMessage('Invalid mode'),
  body('duration').optional().isInt({ min: 30 }).withMessage('Duration must be at least 30 minutes')
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

    const {
      teacherId,
      subject,
      message,
      preferredDate,
      preferredTime,
      preferredMode,
      duration
    } = req.body;

    // Check if teacher exists in database
    const teacher = await User.findOne({ 
      where: { 
        id: teacherId,
        role: 'teacher' 
      } 
    });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Combine date and time into a proper datetime
    let preferredDateTime;
    if (preferredDate && preferredTime) {
      // preferredDate is like "2025-11-03", preferredTime is like "11:00 AM"
      preferredDateTime = new Date(`${preferredDate} ${preferredTime}`);
    } else if (preferredDate) {
      // If only date provided, use start of day
      preferredDateTime = new Date(preferredDate);
    } else {
      // Default to tomorrow at 9 AM if not provided
      preferredDateTime = new Date();
      preferredDateTime.setDate(preferredDateTime.getDate() + 1);
      preferredDateTime.setHours(9, 0, 0, 0);
    }

    // Create request in database
    const request = await LessonRequest.create({
      studentId: req.user.id,
      teacherId,
      subject,
      message: message || '',
      preferredTime: preferredDateTime,
      preferredMode: preferredMode || 'online',
      status: 'pending'
    });

    // Fetch the created request with student and teacher info
    const requestWithDetails = await LessonRequest.findByPk(request.id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email', 'avatarUrl', 'pushToken']
        }
      ]
    });

    // Send push notification to teacher about new request
    try {
      await notifyTeacherNewRequest(
        requestWithDetails.teacher,
        requestWithDetails.student,
        {
          id: request.id,
          subject: request.subject,
          preferredTime: request.preferredTime
        }
      );
    } catch (notificationError) {
      console.error('Failed to send notification to teacher:', notificationError);
      // Don't fail the request creation if notification fails
    }

    res.status(201).json({
      success: true,
      data: requestWithDetails,
      message: 'Request created successfully'
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /api/requests/:id - Update request status
router.patch('/:id', authenticate, [
  body('status').isIn(['pending', 'accepted', 'rejected', 'completed', 'cancelled']).withMessage('Invalid status')
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

    const requestId = req.params.id;
    const request = await LessonRequest.findByPk(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Check if user is authorized to update this request
    if (request.studentId !== req.user.id && request.teacherId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this request'
      });
    }

    const { status } = req.body;

    // Update request
    await request.update({ status });

    // If teacher accepts the request, mark the availability slot as reserved
    if (status === 'accepted' && req.user.id === request.teacherId) {
      try {
        const preferredTime = new Date(request.preferredTime);
        const dayOfWeek = preferredTime.toLocaleDateString('en-US', { weekday: 'long' });
        const startTime = preferredTime.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
        
        // Find and update matching availability slot
        const updated = await TeacherAvailability.update(
          {
            isReserved: true,
            reservedBy: request.studentId,
            lessonRequestId: requestId
          },
          {
            where: {
              teacherId: request.teacherId,
              dayOfWeek: dayOfWeek,
              startTime: startTime,
              isActive: true,
              isReserved: false
            }
          }
        );

        if (updated[0] > 0) {
          console.log(`✅ Reserved availability slot for teacher ${request.teacherId} on ${dayOfWeek} at ${startTime}`);
        } else {
          console.log(`⚠️ No matching availability slot found for ${dayOfWeek} at ${startTime}`);
        }
      } catch (reservationError) {
        console.error('Failed to reserve availability slot:', reservationError);
        // Don't fail the request acceptance if reservation fails
      }
    }

    // If request is rejected or cancelled, free up the slot
    if ((status === 'rejected' || status === 'cancelled') && request.status === 'accepted') {
      try {
        await TeacherAvailability.update(
          {
            isReserved: false,
            reservedBy: null,
            lessonRequestId: null
          },
          {
            where: {
              lessonRequestId: requestId,
              isActive: true
            }
          }
        );
        console.log(`✅ Freed availability slot for request ${requestId}`);
      } catch (freeSlotError) {
        console.error('Failed to free availability slot:', freeSlotError);
      }
    }

    // Fetch updated request with user details
    const updatedRequest = await LessonRequest.findByPk(requestId, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'avatarUrl', 'pushToken']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ]
    });

    // Send push notification to student about request status change
    try {
      await notifyStudentRequestUpdate(
        updatedRequest.student,
        updatedRequest.teacher,
        {
          id: requestId,
          subject: updatedRequest.subject,
          preferredTime: updatedRequest.preferredTime
        },
        status
      );
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.json({
      success: true,
      data: updatedRequest,
      message: `Request ${status} successfully`
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/requests/:id - Get request by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await LessonRequest.findByPk(requestId, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Check if user is authorized to view this request
    if (request.studentId !== req.user.id && request.teacherId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this request'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/requests/:id - Delete/cancel request
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await LessonRequest.findByPk(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Only student who created the request can delete it
    if (request.studentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this request'
      });
    }

    // Delete the request
    await request.destroy();

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;