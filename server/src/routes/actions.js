const express = require('express');
const { authenticate } = require('../middleware/auth');
const User = require('../models/user');
const router = express.Router();

// Get supported languages
router.get('/languages', (req, res) => {
  const supportedLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی' }
  ];

  res.json({
    success: true,
    languages: supportedLanguages
  });
});

// Get application preferences/settings
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'languages', 'emailVerified', 'phoneVerified']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      preferences: {
        languages: user.languages || ['en'],
        notifications: {
          email: user.emailVerified,
          push: true, // Default to true
          sms: user.phoneVerified
        },
        privacy: {
          profileVisibility: 'public', // Default setting
          showEmail: false,
          showPhone: false
        },
        accessibility: {
          fontSize: 'medium',
          highContrast: false,
          reduceMotion: false
        }
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update application preferences
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const { languages, notifications, privacy, accessibility } = req.body;

    const updateData = {};
    if (languages && Array.isArray(languages)) {
      updateData.languages = languages;
    }

    // For now, we'll only update the languages in the database
    // Other preferences would typically be stored in a separate preferences table
    if (Object.keys(updateData).length > 0) {
      await User.update(updateData, {
        where: { id: req.user.id }
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      updatedPreferences: {
        languages: languages || [],
        notifications: notifications || {},
        privacy: privacy || {},
        accessibility: accessibility || {}
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Search users (for connecting/messaging)
router.get('/search', authenticate, async (req, res) => {
  try {
    const { query, role, limit = 10 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const whereClause = {
      isActive: true,
      [require('sequelize').Op.and]: [
        { id: { [require('sequelize').Op.ne]: req.user.id } }, // Exclude current user
        {
          [require('sequelize').Op.or]: [
            { name: { [require('sequelize').Op.iLike]: `%${query}%` } },
            { email: { [require('sequelize').Op.iLike]: `%${query}%` } }
          ]
        }
      ]
    };

    if (role && ['student', 'teacher', 'admin'].includes(role)) {
      whereClause.role = role;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'role', 'avatarUrl', 'bio'],
      limit: parseInt(limit),
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get user notifications (placeholder)
router.get('/notifications', authenticate, async (req, res) => {
  try {
    // This would typically fetch from a notifications table
    // For now, returning a placeholder structure
    const notifications = [
      {
        id: '1',
        type: 'post_like',
        title: 'Someone liked your post',
        message: 'Your recent post received a new like',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'new_comment',
        title: 'New comment on your post',
        message: 'Someone commented on your post',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }
    ];

    res.json({
      success: true,
      notifications: notifications,
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // This would typically update a notifications table
    // For now, just return success
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Get app info/about
router.get('/about', (req, res) => {
  res.json({
    success: true,
    app: {
      name: 'Aqra',
      version: '1.0.0',
      description: 'Educational platform connecting students and teachers',
      features: [
        'Profile Management',
        'Posts & Comments',
        'Direct Messaging',
        'Lesson Requests',
        'Reviews & Ratings',
        'Multi-language Support'
      ],
      supportedLanguages: ['English', 'Arabic', 'French', 'Spanish', 'German', 'Italian', 'Turkish', 'Persian'],
      contact: {
        email: 'support@aqra.app',
        website: 'https://aqra.app'
      }
    }
  });
});

module.exports = router;