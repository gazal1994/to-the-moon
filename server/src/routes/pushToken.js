const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/push-token
 * Register or update push notification token for the authenticated user
 * Works for both teachers and students
 */
router.post('/', 
  authenticate,
  [
    body('pushToken').notEmpty().withMessage('Push token is required'),
    body('pushProvider').optional().isIn(['fcm', 'apns']).withMessage('Push provider must be fcm or apns')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { pushToken, pushProvider = 'fcm' } = req.body;
      const userId = req.user.id;

      // Update user's push token
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      await user.update({
        pushToken,
        pushProvider
      });

      console.log(`✅ Push token registered for ${user.role} ${user.name} (${userId})`);

      res.json({
        success: true,
        message: 'Push token registered successfully',
        data: {
          userId,
          pushProvider,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Register push token error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to register push token'
      });
    }
  }
);

/**
 * DELETE /api/push-token
 * Remove push notification token (for logout)
 */
router.delete('/', 
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      await user.update({
        pushToken: null,
        pushProvider: null
      });

      console.log(`✅ Push token removed for ${user.role} ${user.name} (${userId})`);

      res.json({
        success: true,
        message: 'Push token removed successfully'
      });
    } catch (error) {
      console.error('Remove push token error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove push token'
      });
    }
  }
);

module.exports = router;
