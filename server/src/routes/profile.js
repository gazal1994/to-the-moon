const express = require('express');
const { authenticate } = require('../middleware/auth');
const User = require('../models/user');
const TeacherProfile = require('../models/teacherProfile');
const StudentProfile = require('../models/studentProfile');
const bcrypt = require('bcrypt');
const router = express.Router();

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: TeacherProfile,
          as: 'teacherProfile',
          required: false
        },
        {
          model: StudentProfile,
          as: 'studentProfile',
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, phone, avatarUrl, gender, bio, languages } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (gender !== undefined) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;
    if (languages !== undefined && Array.isArray(languages)) updateData.languages = languages;

    const [updated] = await User.update(updateData, {
      where: { id: req.user.id }
    });

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change user language preference
router.put('/language', authenticate, async (req, res) => {
  try {
    const { language, languages } = req.body;

    let languageArray;
    if (language) {
      // Single language provided
      languageArray = [language];
    } else if (languages && Array.isArray(languages)) {
      // Multiple languages provided
      languageArray = languages;
    } else {
      return res.status(400).json({ error: 'Language or languages array is required' });
    }

    // Validate language codes (basic validation)
    const validLanguages = ['en', 'ar', 'fr', 'es', 'de', 'it', 'tr', 'fa'];
    const invalidLanguages = languageArray.filter(lang => !validLanguages.includes(lang));
    
    if (invalidLanguages.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid language codes', 
        invalidLanguages,
        supportedLanguages: validLanguages
      });
    }

    const [updated] = await User.update(
      { languages: languageArray },
      { where: { id: req.user.id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Language preference updated successfully',
      languages: languageArray
    });
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({ error: 'Failed to update language preference' });
  }
});

// Change password
router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get user with password
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.update(
      { passwordHash: newPasswordHash },
      { where: { id: req.user.id } }
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Upload avatar (placeholder for file upload)
router.post('/avatar', authenticate, async (req, res) => {
  try {
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ error: 'Avatar URL is required' });
    }

    const [updated] = await User.update(
      { avatarUrl },
      { where: { id: req.user.id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      avatarUrl
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// Get account settings
router.get('/settings', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'emailVerified', 'phoneVerified', 'languages', 'isActive']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      settings: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        languages: user.languages,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch account settings' });
  }
});

// Update account settings
router.put('/settings', authenticate, async (req, res) => {
  try {
    const { email, phone } = req.body;

    const updateData = {};
    if (email !== undefined) {
      updateData.email = email;
      updateData.emailVerified = false; // Reset verification when email changes
    }
    if (phone !== undefined) {
      updateData.phone = phone;
      updateData.phoneVerified = false; // Reset verification when phone changes
    }

    const [updated] = await User.update(updateData, {
      where: { id: req.user.id }
    });

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Account settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update account settings' });
    }
  }
});

// Get user's activity summary
router.get('/activity', authenticate, async (req, res) => {
  try {
    // This would typically include user's posts, comments, likes, etc.
    // For now, we'll return a basic structure
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'role', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      activity: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          memberSince: user.createdAt
        },
        stats: {
          postsCount: 0, // Would be calculated from posts table
          commentsCount: 0, // Would be calculated from comments table
          likesReceived: 0, // Would be calculated from likes
          profileViews: 0 // Would be tracked separately
        }
      }
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// Deactivate account
router.put('/deactivate', authenticate, async (req, res) => {
  try {
    const [updated] = await User.update(
      { isActive: false },
      { where: { id: req.user.id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ error: 'Failed to deactivate account' });
  }
});

// Reactivate account
router.put('/reactivate', authenticate, async (req, res) => {
  try {
    const [updated] = await User.update(
      { isActive: true },
      { where: { id: req.user.id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Account reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate account error:', error);
    res.status(500).json({ error: 'Failed to reactivate account' });
  }
});

module.exports = router;