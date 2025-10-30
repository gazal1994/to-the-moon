const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, users } = require('../middleware/auth');

const router = express.Router();

// Mock reviews database
const reviews = new Map();
let reviewIdCounter = 1;

// GET /api/reviews/teacher/:teacherId - Get reviews for a teacher
router.get('/teacher/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if teacher exists
    const teacher = users.get(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Get reviews for teacher
    let teacherReviews = Array.from(reviews.values()).filter(
      review => review.teacherId === teacherId
    );

    // Sort by creation date (newest first)
    teacherReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedReviews = teacherReviews.slice(startIndex, endIndex);

    // Calculate average rating
    const averageRating = teacherReviews.length > 0 
      ? teacherReviews.reduce((sum, review) => sum + review.rating, 0) / teacherReviews.length
      : 0;

    res.json({
      success: true,
      data: {
        data: paginatedReviews,
        total: teacherReviews.length,
        page: pageNum,
        limit: limitNum,
        hasMore: endIndex < teacherReviews.length,
        averageRating: Math.round(averageRating * 10) / 10
      }
    });
  } catch (error) {
    console.error('Get teacher reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/reviews - Create new review
router.post('/', authenticate, [
  body('teacherId').notEmpty().withMessage('Teacher ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
  body('requestId').optional().isInt().withMessage('Request ID must be a number')
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

    const { teacherId, rating, comment, requestId } = req.body;

    // Check if teacher exists
    const teacher = users.get(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Check if student already reviewed this teacher
    const existingReview = Array.from(reviews.values()).find(
      review => review.studentId === req.user.id && review.teacherId === teacherId
    );

    if (existingReview) {
      return res.status(409).json({
        success: false,
        error: 'You have already reviewed this teacher'
      });
    }

    // Create review
    const review = {
      id: reviewIdCounter++,
      studentId: req.user.id,
      teacherId,
      rating,
      comment,
      requestId: requestId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    reviews.set(review.id, review);

    // Update teacher's rating (simplified calculation)
    const teacherReviews = Array.from(reviews.values()).filter(r => r.teacherId === teacherId);
    const averageRating = teacherReviews.reduce((sum, r) => sum + r.rating, 0) / teacherReviews.length;
    
    const updatedTeacher = {
      ...teacher,
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: teacherReviews.length
    };
    users.set(teacherId, updatedTeacher);

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/reviews/my - Get current user's reviews
router.get('/my', authenticate, (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get reviews by current user
    let userReviews = Array.from(reviews.values()).filter(
      review => review.studentId === req.user.id
    );

    // Sort by creation date (newest first)
    userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedReviews = userReviews.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        data: paginatedReviews,
        total: userReviews.length,
        page: pageNum,
        limit: limitNum,
        hasMore: endIndex < userReviews.length
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /api/reviews/:id - Update review
router.patch('/:id', authenticate, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().notEmpty().withMessage('Comment cannot be empty')
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

    const reviewId = parseInt(req.params.id);
    const review = reviews.get(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.studentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this review'
      });
    }

    const { rating, comment } = req.body;

    // Update review
    const updatedReview = {
      ...review,
      ...(rating && { rating }),
      ...(comment && { comment }),
      updatedAt: new Date()
    };

    reviews.set(reviewId, updatedReview);

    // Recalculate teacher's rating if rating was updated
    if (rating) {
      const teacherReviews = Array.from(reviews.values()).filter(r => r.teacherId === review.teacherId);
      const averageRating = teacherReviews.reduce((sum, r) => sum + r.rating, 0) / teacherReviews.length;
      
      const teacher = users.get(review.teacherId);
      const updatedTeacher = {
        ...teacher,
        rating: Math.round(averageRating * 10) / 10
      };
      users.set(review.teacherId, updatedTeacher);
    }

    res.json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', authenticate, (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const review = reviews.get(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.studentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this review'
      });
    }

    reviews.delete(reviewId);

    // Recalculate teacher's rating
    const teacherReviews = Array.from(reviews.values()).filter(r => r.teacherId === review.teacherId);
    const averageRating = teacherReviews.length > 0 
      ? teacherReviews.reduce((sum, r) => sum + r.rating, 0) / teacherReviews.length
      : 0;
    
    const teacher = users.get(review.teacherId);
    const updatedTeacher = {
      ...teacher,
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: teacherReviews.length
    };
    users.set(review.teacherId, updatedTeacher);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;