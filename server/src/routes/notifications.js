const express = require('express');
const { authenticate } = require('../middleware/auth');
const { 
  getStoredNotifications, 
  clearNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
  unsubscribeFromNotifications
} = require('../services/redisNotificationService');

const router = express.Router();

// GET /api/notifications - Get user's notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const notifications = await getStoredNotifications(req.user.id, parseInt(limit));
    
    res.json({
      success: true,
      notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /api/notifications/read-all - Mark all notifications as read (must be before /:id routes)
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await markAllNotificationsAsRead(req.user.id);
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await markNotificationAsRead(req.user.id, id);
    
    res.json({
      success: true,
      updated: result.updated
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/notifications - Clear all notifications
router.delete('/', authenticate, async (req, res) => {
  try {
    await clearNotifications(req.user.id);
    
    res.json({
      success: true,
      message: 'Notifications cleared'
    });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// SSE endpoint for real-time notifications
router.get('/stream', authenticate, (req, res) => {
  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial connection success message
  res.write('data: {"type":"connected","message":"Notification stream connected"}\n\n');

  // Subscribe to Redis notifications
  subscribeToNotifications(req.user.id, (notification) => {
    // Send notification to client
    res.write(`data: ${JSON.stringify(notification)}\n\n`);
  });

  // Handle client disconnect
  req.on('close', () => {
    unsubscribeFromNotifications(req.user.id);
    console.log(`🔌 Client disconnected from notification stream: ${req.user.id}`);
    res.end();
  });
});

module.exports = router;
