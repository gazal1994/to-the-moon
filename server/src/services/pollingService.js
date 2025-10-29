const { Op } = require('sequelize');
const { User, LessonRequest } = require('../models');
const { notifyTeacherNewRequest } = require('./notificationService');

/**
 * Background polling service to check for new lesson requests
 * and send push notifications to teachers
 */

let pollingInterval = null;
let isPolling = false;

/**
 * Check for new lesson requests that haven't been notified yet
 */
async function checkNewRequests() {
  try {
    // Prevent overlapping polls
    if (isPolling) {
      console.log('⏭️  Skipping poll - previous poll still running');
      return;
    }

    isPolling = true;

    // Query for new, unnotified lesson requests
    const newRequests = await LessonRequest.findAll({
      where: {
        status: 'pending', // or 'NEW' if you add that status
        notified: false
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'avatar_url']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email', 'pushToken', 'pushProvider']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    if (newRequests.length > 0) {
      console.log(`📬 Found ${newRequests.length} new lesson request(s) to notify`);

      // Process each request
      for (const request of newRequests) {
        try {
          const teacher = request.teacher;
          const student = request.student;

          if (!teacher || !student) {
            console.warn(`⚠️  Request ${request.id} missing teacher or student`);
            continue;
          }

          // Check if teacher has push token
          if (teacher.pushToken) {
            console.log(`📤 Sending notification to teacher ${teacher.name} for request ${request.id}`);
            
            // Send push notification
            await notifyTeacherNewRequest(teacher, student, request);
            
            // Mark as notified
            await request.update({ notified: true });
            
            console.log(`✅ Notified teacher ${teacher.name} about request ${request.id}`);
          } else {
            console.log(`⚠️  Teacher ${teacher.name} has no push token, marking as notified anyway`);
            // Still mark as notified to avoid repeated attempts
            await request.update({ notified: true });
          }
        } catch (error) {
          console.error(`❌ Error processing request ${request.id}:`, error);
          // Continue to next request even if this one fails
        }
      }
    } else {
      // Only log every 12th check (once per minute if checking every 5 seconds)
      if (Math.random() < 0.083) {
        console.log('✓ No new requests to notify');
      }
    }
  } catch (error) {
    console.error('❌ Error in checkNewRequests:', error);
  } finally {
    isPolling = false;
  }
}

/**
 * Start the polling service
 * @param {number} intervalMs - Polling interval in milliseconds (default: 5000 = 5 seconds)
 */
function startPolling(intervalMs = 5000) {
  if (pollingInterval) {
    console.log('⚠️  Polling service already running');
    return;
  }

  console.log(`🔄 Starting push notification polling service (interval: ${intervalMs}ms)`);
  
  // Run immediately on start
  checkNewRequests();
  
  // Then run at intervals
  pollingInterval = setInterval(checkNewRequests, intervalMs);
  
  console.log('✅ Polling service started successfully');
}

/**
 * Stop the polling service
 */
function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('🛑 Polling service stopped');
  }
}

/**
 * Get polling service status
 */
function getPollingStatus() {
  return {
    running: pollingInterval !== null,
    isCurrentlyPolling: isPolling
  };
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing polling service');
  stopPolling();
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing polling service');
  stopPolling();
});

module.exports = {
  startPolling,
  stopPolling,
  getPollingStatus,
  checkNewRequests
};
