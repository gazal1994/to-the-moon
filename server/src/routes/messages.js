const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { Message, User } = require('../models');
const { Op } = require('sequelize');
const socketService = require('../services/socketService');
const { v5: uuidv5 } = require('uuid');

const router = express.Router();

// Namespace for conversation ID generation (fixed UUID)
const CONVERSATION_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

/**
 * Generate a deterministic conversation ID from two user IDs
 * Always generates the same UUID for the same two users regardless of order
 */
function generateConversationId(userId1, userId2) {
  // Sort user IDs to ensure consistency regardless of who sends first
  const sortedIds = [userId1, userId2].sort();
  const conversationKey = sortedIds.join(':');
  return uuidv5(conversationKey, CONVERSATION_NAMESPACE);
}

// GET /api/messages/conversations - Get user's conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Getting conversations for user:', userId);

    // Get all messages where user is sender or receiver
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log('Found', messages.length, 'messages');

    // Group messages by conversation partner
    const conversationMap = new Map();
    
    messages.forEach(message => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = message.senderId === userId ? message.receiver : message.sender;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          id: otherUserId, // Using otherUserId as conversation ID for simplicity
          participants: [userId, otherUserId],
          lastMessage: message.content,
          lastMessageAt: message.created_at,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            role: otherUser.role
          },
          unreadCount: 0
        });
      }

      // Count unread messages
      if (message.receiverId === userId && !message.isRead) {
        conversationMap.get(otherUserId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationMap.values());
    conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    console.log('Returning', conversations.length, 'conversations');

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/messages/conversations/:id - Get conversation messages
router.get('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const otherUserId = req.params.id; // ID of the other user in conversation
    const userId = req.user.id;
    
    console.log('Getting messages between', userId, 'and', otherUserId);

    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Get messages between the two users
    const { count, rows: conversationMessages } = await Message.findAndCountAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['created_at', 'ASC']],
      limit: limitNum,
      offset: offset
    });

    console.log('Found', count, 'messages');

    res.json({
      success: true,
      data: {
        data: conversationMessages,
        total: count,
        page: pageNum,
        limit: limitNum,
        hasMore: offset + limitNum < count
      }
    });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/messages - Send new message
router.post('/', authenticate, [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('type').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type')
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

    const { receiverId, content, type = 'text' } = req.body;

    // Check if receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: 'Receiver not found'
      });
    }

    // Generate conversation ID from both user IDs
    const conversationId = generateConversationId(req.user.id, receiverId);

    // Create message with conversation ID
    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content,
      messageType: type,
      conversationId,
      isRead: false
    });

    // Load sender and receiver data
    const messageWithUsers = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    // Emit Socket.IO event to receiver for real-time delivery
    socketService.emitToUser(receiverId, 'receive_message', messageWithUsers);
    
    // Update conversations list for both users
    socketService.emitToUser(receiverId, 'conversation_updated', {
      otherUserId: req.user.id,
      lastMessage: content,
      lastMessageAt: message.created_at
    });
    
    socketService.emitToUser(req.user.id, 'conversation_updated', {
      otherUserId: receiverId,
      lastMessage: content,
      lastMessageAt: message.created_at
    });

    console.log(`✓ Message sent from ${req.user.id} to ${receiverId} via Socket.IO`);

    res.status(201).json({
      success: true,
      data: messageWithUsers,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /api/messages/conversation/:userId/mark-read - Mark all messages from a user as read
router.patch('/conversation/:userId/mark-read', authenticate, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user.id;

    // Mark all unread messages from the other user as read
    const [updatedCount] = await Message.update(
      {
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          senderId: otherUserId,
          receiverId: currentUserId,
          isRead: false
        }
      }
    );

    console.log(`✅ Marked ${updatedCount} messages as read from ${otherUserId} to ${currentUserId}`);

    res.json({
      success: true,
      data: { updatedCount },
      message: `Marked ${updatedCount} messages as read`
    });
  } catch (error) {
    console.error('Mark conversation messages as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /api/messages/:id/read - Mark message as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    // Check if user is the receiver
    if (message.receiverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to mark this message as read'
      });
    }

    // Update message
    await message.update({
      isRead: true,
      readAt: new Date()
    });

    res.json({
      success: true,
      data: message,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/messages/unread-count - Get unread messages count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const unreadCount = await Message.count({
      where: {
        receiverId: req.user.id,
        isRead: false
      }
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;