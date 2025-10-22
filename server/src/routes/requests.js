const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, users } = require('../middleware/auth');

const router = express.Router();

// Mock requests database
const requests = new Map();
let requestIdCounter = 1;

// GET /api/requests - Get user's requests
router.get('/', authenticate, (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    // Get requests for current user (either as student or teacher)
    let userRequests = Array.from(requests.values()).filter(
      req => req.studentId === req.user.id || req.teacherId === req.user.id
    );

    // Filter by status if provided
    if (status) {
      userRequests = userRequests.filter(req => req.status === status);
    }

    // Sort by creation date (newest first)
    userRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedRequests = userRequests.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        data: paginatedRequests,
        total: userRequests.length,
        page: pageNum,
        limit: limitNum,
        hasMore: endIndex < userRequests.length
      }
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
  body('duration').optional().isInt({ min: 30 }).withMessage('Duration must be at least 30 minutes')
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

    const {
      teacherId,
      subject,
      message,
      preferredDate,
      duration
    } = req.body;

    // Check if teacher exists
    const teacher = users.get(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Create request
    const request = {
      id: requestIdCounter++,
      studentId: req.user.id,
      teacherId,
      subject,
      message: message || '',
      preferredDate: preferredDate || null,
      duration: duration || 60,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    requests.set(request.id, request);

    res.status(201).json({
      success: true,
      data: request,
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

    const requestId = parseInt(req.params.id);
    const request = requests.get(requestId);

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
    const updatedRequest = {
      ...request,
      status,
      updatedAt: new Date()
    };

    requests.set(requestId, updatedRequest);

    res.json({
      success: true,
      data: updatedRequest,
      message: 'Request updated successfully'
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
router.get('/:id', authenticate, (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const request = requests.get(requestId);

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

module.exports = router;