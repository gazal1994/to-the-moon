const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: You'll need to set up a Firebase project and download the service account key
// For now, we'll initialize without credentials (will need to be configured in production)
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) return;
  
  try {
    // In production, use a service account key file:
    // const serviceAccount = require('path/to/serviceAccountKey.json');
    // admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccount)
    // });
    
    // For development, you can use default credentials or skip initialization
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized');
    } else {
      console.log('⚠️ Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT environment variable.');
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

// Initialize on module load
initializeFirebase();

/**
 * Send push notification to a user via Firebase Cloud Messaging
 * @param {string} pushToken - User's FCM push token
 * @param {object} notification - Notification data
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {object} notification.data - Additional data to send with notification
 */
async function sendPushNotification(pushToken, notification) {
  try {
    if (!firebaseInitialized) {
      console.log('⚠️ Firebase not initialized, skipping notification');
      return { success: false, error: 'Firebase not configured' };
    }

    // Construct the FCM message
    const message = {
      token: pushToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    // Send the notification
    const response = await admin.messaging().send(message);
    console.log('📱 Push notification sent:', response);
    
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send notification to teacher about new lesson request
 */
async function notifyTeacherNewRequest(teacher, student, request) {
  if (!teacher.pushToken) {
    console.log(`⚠️ Teacher ${teacher.name} has no push token registered`);
    return;
  }

  const notification = {
    title: '📚 New Lesson Request',
    body: `${student.name} has requested a lesson for ${request.subject}`,
    data: {
      type: 'NEW_REQUEST',
      requestId: request.id,
      studentId: student.id,
      studentName: student.name,
      subject: request.subject,
      screen: 'Requests',
    },
  };

  const result = await sendPushNotification(teacher.pushToken, notification);
  
  if (result.success) {
    console.log(`✅ Notification sent to teacher ${teacher.name}`);
  } else {
    console.log(`❌ Failed to send notification to teacher ${teacher.name}:`, result.error);
  }
}

/**
 * Send notification to student about request status change
 */
async function notifyStudentRequestUpdate(student, teacher, request, status) {
  if (!student.pushToken) {
    console.log(`⚠️ Student ${student.name} has no push token registered`);
    return;
  }

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
    title,
    body,
    data: {
      type: 'REQUEST_UPDATE',
      requestId: request.id,
      teacherId: teacher.id,
      teacherName: teacher.name,
      subject: request.subject,
      status,
      screen: 'Requests',
    },
  };

  const result = await sendPushNotification(student.pushToken, notification);
  
  if (result.success) {
    console.log(`✅ Notification sent to student ${student.name}`);
  } else {
    console.log(`❌ Failed to send notification to student ${student.name}:`, result.error);
  }
}

module.exports = {
  sendPushNotification,
  notifyTeacherNewRequest,
  notifyStudentRequestUpdate,
};
