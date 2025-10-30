const Redis = require('ioredis');

// Create Redis clients for pub/sub
const redisPublisher = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 3,
});

const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 3,
});

// Connection event handlers
redisPublisher.on('connect', () => {
  console.log('✅ Redis publisher connected');
});

redisPublisher.on('error', (err) => {
  console.error('❌ Redis publisher error:', err);
});

redisSubscriber.on('connect', () => {
  console.log('✅ Redis subscriber connected');
});

redisSubscriber.on('error', (err) => {
  console.error('❌ Redis subscriber error:', err);
});

/**
 * Publish a notification event to Redis
 * @param {string} userId - Target user ID
 * @param {object} notification - Notification data
 */
async function publishNotification(userId, notification) {
  try {
    const channel = `notifications:${userId}`;
    const message = JSON.stringify({
      ...notification,
      userId, // Add userId to the notification object
      timestamp: notification.timestamp || new Date().toISOString(),
    });
    
    await redisPublisher.publish(channel, message);
    console.log(`📢 Published notification to ${channel}`);
    
    // Also store in Redis list for persistence (last 100 notifications)
    const listKey = `notifications:list:${userId}`;
    await redisPublisher.lpush(listKey, message);
    await redisPublisher.ltrim(listKey, 0, 99); // Keep only last 100
    
    return { success: true };
  } catch (error) {
    console.error('Error publishing notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to notifications for a specific user
 * @param {string} userId - User ID to subscribe to
 * @param {function} callback - Callback function when notification received
 */
function subscribeToNotifications(userId, callback) {
  const channel = `notifications:${userId}`;
  
  redisSubscriber.subscribe(channel, (err, count) => {
    if (err) {
      console.error('Failed to subscribe to channel:', err);
      return;
    }
    console.log(`📻 Subscribed to ${channel} (${count} channels active)`);
  });
  
  redisSubscriber.on('message', (receivedChannel, message) => {
    if (receivedChannel === channel) {
      try {
        const notification = JSON.parse(message);
        callback(notification);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    }
  });
}

/**
 * Unsubscribe from user notifications
 * @param {string} userId - User ID to unsubscribe from
 */
function unsubscribeFromNotifications(userId) {
  const channel = `notifications:${userId}`;
  redisSubscriber.unsubscribe(channel);
  console.log(`🔕 Unsubscribed from ${channel}`);
}

/**
 * Get stored notifications for a user
 * @param {string} userId - User ID
 * @param {number} limit - Max number of notifications to retrieve
 */
async function getStoredNotifications(userId, limit = 20) {
  try {
    const listKey = `notifications:list:${userId}`;
    const notifications = await redisPublisher.lrange(listKey, 0, limit - 1);
    
    return notifications.map(notif => JSON.parse(notif));
  } catch (error) {
    console.error('Error getting stored notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 * @param {string} userId - User ID
 * @param {string} notificationId - Notification ID to mark as read
 */
async function markNotificationAsRead(userId, notificationId) {
  try {
    const listKey = `notifications:list:${userId}`;
    const notifications = await redisPublisher.lrange(listKey, 0, -1);
    
    // Update the notification's read status
    let updated = false;
    const updatedNotifications = notifications.map(notif => {
      const parsed = JSON.parse(notif);
      if (parsed.id === notificationId) {
        parsed.read = true;
        updated = true;
      }
      return JSON.stringify(parsed);
    });
    
    if (updated) {
      // Replace the entire list with updated notifications
      await redisPublisher.del(listKey);
      if (updatedNotifications.length > 0) {
        await redisPublisher.rpush(listKey, ...updatedNotifications);
      }
    }
    
    return { success: true, updated };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 */
async function markAllNotificationsAsRead(userId) {
  try {
    const listKey = `notifications:list:${userId}`;
    const notifications = await redisPublisher.lrange(listKey, 0, -1);
    
    // Update all notifications to read
    const updatedNotifications = notifications.map(notif => {
      const parsed = JSON.parse(notif);
      parsed.read = true;
      return JSON.stringify(parsed);
    });
    
    // Replace the entire list with updated notifications
    await redisPublisher.del(listKey);
    if (updatedNotifications.length > 0) {
      await redisPublisher.rpush(listKey, ...updatedNotifications);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear notifications for a user
 * @param {string} userId - User ID
 */
async function clearNotifications(userId) {
  try {
    const listKey = `notifications:list:${userId}`;
    await redisPublisher.del(listKey);
    return { success: true };
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify teacher about new lesson request
 */
async function notifyTeacherNewRequest(teacher, student, request) {
  const notification = {
    id: `request_${request.id}`,
    type: 'NEW_REQUEST',
    title: '📚 New Lesson Request',
    body: `${student.name} has requested a lesson for ${request.subject}`,
    data: {
      requestId: request.id,
      studentId: student.id,
      studentName: student.name,
      studentAvatar: student.avatarUrl,
      subject: request.subject,
      preferredTime: request.preferredTime,
      preferredMode: request.preferredMode,
      screen: 'Requests',
    },
    read: false,
  };

  await publishNotification(teacher.id, notification);
  console.log(`✅ Notification sent to teacher ${teacher.name}`);
}

/**
 * Notify student about request status change
 */
async function notifyStudentRequestUpdate(student, teacher, request, status) {
  let title, body;
  
  switch (status) {
    case 'accepted':
      title = '✅ Request Accepted';
      body = `${teacher.name} has accepted your lesson request for ${request.subject}`;
      break;
    case 'rejected':
      title = '❌ Request Declined';
      body = `${teacher.name} has declined your lesson request for ${request.subject}`;
      break;
    case 'cancelled':
      title = '🚫 Request Cancelled';
      body = `Your lesson request for ${request.subject} has been cancelled`;
      break;
    case 'completed':
      title = '🎓 Lesson Completed';
      body = `Your lesson with ${teacher.name} for ${request.subject} is complete`;
      break;
    default:
      title = '📬 Request Updated';
      body = `Your lesson request status has changed to ${status}`;
  }

  const notification = {
    id: `request_${request.id}_${status}`,
    type: 'REQUEST_UPDATE',
    title,
    body,
    data: {
      requestId: request.id,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherAvatar: teacher.avatarUrl,
      subject: request.subject,
      status,
      screen: 'Requests',
    },
    read: false,
  };

  await publishNotification(student.id, notification);
  console.log(`✅ Notification sent to student ${student.name}`);
}

module.exports = {
  publishNotification,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  getStoredNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  notifyTeacherNewRequest,
  notifyStudentRequestUpdate,
};
