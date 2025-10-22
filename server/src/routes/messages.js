const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, users } = require('../middleware/auth');

const router = express.Router();

// Mock messages database
const messages = new Map();
const conversations = new Map();
let messageIdCounter = 1;
let conversationIdCounter = 1;

// GET /api/messages/conversations - Get user's conversations
router.get('/conversations', authenticate, (req, res) => {
  try {
    const userConversations = Array.from(conversations.values()).filter(
      conv => conv.participants.includes(req.user.id)
    );

    // Sort by last message date
    userConversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    res.json({
      success: true,
      data: userConversations
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
router.get('/conversations/:id/messages', authenticate, (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const conversation = conversations.get(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this conversation'
      });
    }

    const { page = 1, limit = 50 } = req.query;

    // Get messages for conversation
    let conversationMessages = Array.from(messages.values()).filter(
      msg => msg.conversationId === conversationId
    );

    // Sort by creation date (newest first for pagination)
    conversationMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedMessages = conversationMessages.slice(startIndex, endIndex);

    // Reverse for chronological order in UI
    paginatedMessages.reverse();

    res.json({
      success: true,
      data: {
        data: paginatedMessages,
        total: conversationMessages.length,
        page: pageNum,
        limit: limitNum,
        hasMore: endIndex < conversationMessages.length
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

    const { receiverId, content, type = 'text' } = req.body;

    // Check if receiver exists
    const receiver = users.get(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: 'Receiver not found'
      });
    }

    // Find or create conversation
    let conversation = Array.from(conversations.values()).find(
      conv => conv.participants.includes(req.user.id) && conv.participants.includes(receiverId)
    );

    if (!conversation) {
      conversation = {
        id: conversationIdCounter++,
        participants: [req.user.id, receiverId],
        createdAt: new Date(),
        lastMessageAt: new Date()
      };
      conversations.set(conversation.id, conversation);
    }

    // Create message
    const message = {
      id: messageIdCounter++,
      conversationId: conversation.id,
      senderId: req.user.id,
      receiverId,
      content,
      type,
      isRead: false,
      createdAt: new Date()
    };

    messages.set(message.id, message);

    // Update conversation
    conversation.lastMessageAt = new Date();
    conversation.lastMessage = content;
    conversations.set(conversation.id, conversation);

    res.status(201).json({
      success: true,
      data: message,
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

// PATCH /api/messages/:id/read - Mark message as read
router.patch('/:id/read', authenticate, (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const message = messages.get(messageId);

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
    const updatedMessage = {
      ...message,
      isRead: true,
      readAt: new Date()
    };

    messages.set(messageId, updatedMessage);

    res.json({
      success: true,
      data: updatedMessage,
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
router.get('/unread-count', authenticate, (req, res) => {
  try {
    const unreadCount = Array.from(messages.values()).filter(
      msg => msg.receiverId === req.user.id && !msg.isRead
    ).length;

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