const { Server } = require('socket.io');
const Message = require('../models/Message');
const User = require('../models/User');

class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // Map userId to socketId
  }

  /**
   * Initialize Socket.IO with HTTP server
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // In production, specify your React Native app's origin
        methods: ['GET', 'POST']
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.io.on('connection', (socket) => {
      console.log(`✓ Socket connected: ${socket.id}`);

      // Handle user authentication/registration
      socket.on('register', (userId) => {
        this.userSockets.set(userId, socket.id);
        socket.userId = userId;
        socket.join(`user:${userId}`);
        console.log(`✓ User ${userId} registered with socket ${socket.id}`);
        
        // Broadcast user online status
        this.io.emit('user_status', { userId, status: 'online' });
      });

      // Handle sending messages
      socket.on('send_message', async (data) => {
        try {
          const { conversationId, senderId, receiverId, content, messageType = 'text' } = data;
          
          console.log(`📩 Message from ${senderId} to ${receiverId}: ${content}`);

          // Create message in database (handled by the route, but we emit it immediately)
          const messageData = {
            conversationId,
            senderId,
            receiverId,
            content,
            messageType,
            isRead: false,
            createdAt: new Date()
          };

          // Emit to receiver
          this.io.to(`user:${receiverId}`).emit('receive_message', messageData);
          
          // Emit to sender for confirmation
          socket.emit('message_sent', messageData);
          
          // Update conversations list for both users
          this.io.to(`user:${receiverId}`).emit('conversation_updated', {
            conversationId,
            lastMessage: content,
            timestamp: new Date()
          });
          
          this.io.to(`user:${senderId}`).emit('conversation_updated', {
            conversationId,
            lastMessage: content,
            timestamp: new Date()
          });

        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing', (data) => {
        const { receiverId, senderId } = data;
        this.io.to(`user:${receiverId}`).emit('user_typing', { userId: senderId });
      });

      socket.on('stop_typing', (data) => {
        const { receiverId, senderId } = data;
        this.io.to(`user:${receiverId}`).emit('user_stopped_typing', { userId: senderId });
      });

      // Handle message read status
      socket.on('mark_read', async (data) => {
        try {
          const { messageId, userId } = data;
          
          // Update message in database
          await Message.update(
            { isRead: true, readAt: new Date() },
            { where: { id: messageId } }
          );

          // Notify sender that message was read
          const message = await Message.findByPk(messageId);
          if (message) {
            this.io.to(`user:${message.senderId}`).emit('message_read', {
              messageId,
              readAt: new Date()
            });
          }
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`✗ Socket disconnected: ${socket.id}`);
        
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
          
          // Broadcast user offline status
          this.io.emit('user_status', { 
            userId: socket.userId, 
            status: 'offline' 
          });
        }
      });
    });

    console.log('✓ Socket.IO service initialized');
  }

  /**
   * Emit a message to a specific user
   */
  emitToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }

  /**
   * Get Socket.IO instance
   */
  getIO() {
    return this.io;
  }
}

// Export singleton instance
module.exports = new SocketService();
