const { Client } = require('pg');
const { notifyTeacherNewRequest, notifyStudentRequestUpdate } = require('./redisNotificationService');

let pgClient = null;
let isListening = false;

/**
 * Initialize PostgreSQL LISTEN/NOTIFY client
 */
async function initializePgListener() {
  if (pgClient && isListening) {
    console.log('⚠️ PostgreSQL listener already initialized');
    return;
  }

  try {
    // Create a dedicated PostgreSQL client for LISTEN/NOTIFY
    pgClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'aqra',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    await pgClient.connect();
    console.log('✅ PostgreSQL listener client connected');

    // Listen to lesson request created events
    await pgClient.query('LISTEN lesson_request_created');
    console.log('👂 Listening to lesson_request_created channel');

    // Listen to lesson request status update events
    await pgClient.query('LISTEN lesson_request_status_updated');
    console.log('👂 Listening to lesson_request_status_updated channel');

    // Handle notifications
    pgClient.on('notification', async (msg) => {
      try {
        const payload = JSON.parse(msg.payload);
        
        if (msg.channel === 'lesson_request_created') {
          await handleNewLessonRequest(payload);
        } else if (msg.channel === 'lesson_request_status_updated') {
          await handleLessonRequestStatusUpdate(payload);
        }
      } catch (error) {
        console.error('Error handling PostgreSQL notification:', error);
      }
    });

    // Handle connection errors
    pgClient.on('error', (err) => {
      console.error('❌ PostgreSQL listener error:', err);
      isListening = false;
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        console.log('🔄 Attempting to reconnect PostgreSQL listener...');
        initializePgListener();
      }, 5000);
    });

    isListening = true;
    console.log('✅ PostgreSQL LISTEN/NOTIFY service initialized');
  } catch (error) {
    console.error('❌ Failed to initialize PostgreSQL listener:', error);
    
    // Retry after 10 seconds
    setTimeout(() => {
      console.log('🔄 Retrying PostgreSQL listener initialization...');
      initializePgListener();
    }, 10000);
  }
}

/**
 * Handle new lesson request notification from database trigger
 */
async function handleNewLessonRequest(payload) {
  try {
    console.log('📬 New lesson request notification received:', {
      requestId: payload.requestId,
      student: payload.studentName,
      teacher: payload.teacherName,
      subject: payload.subject,
    });

    const teacher = {
      id: payload.teacherId,
      name: payload.teacherName,
      email: payload.teacherEmail,
      avatarUrl: payload.teacherAvatar,
    };

    const student = {
      id: payload.studentId,
      name: payload.studentName,
      email: payload.studentEmail,
      avatarUrl: payload.studentAvatar,
    };

    const request = {
      id: payload.requestId,
      subject: payload.subject,
      message: payload.message,
      preferredTime: payload.preferredTime,
      preferredMode: payload.preferredMode,
      status: payload.status,
    };

    // Send notification via Redis to the teacher
    await notifyTeacherNewRequest(teacher, student, request);
    
    console.log(`✅ Notification sent to teacher ${teacher.name} for new request from ${student.name}`);
  } catch (error) {
    console.error('Error handling new lesson request:', error);
  }
}

/**
 * Handle lesson request status update notification from database trigger
 */
async function handleLessonRequestStatusUpdate(payload) {
  try {
    console.log('📝 Lesson request status update received:', {
      requestId: payload.requestId,
      oldStatus: payload.oldStatus,
      newStatus: payload.newStatus,
    });

    const teacher = {
      id: payload.teacherId,
      name: payload.teacherName,
      email: payload.teacherEmail,
      avatarUrl: payload.teacherAvatar,
    };

    const student = {
      id: payload.studentId,
      name: payload.studentName,
      email: payload.studentEmail,
      avatarUrl: payload.studentAvatar,
    };

    const request = {
      id: payload.requestId,
      subject: payload.subject,
      responseMessage: payload.responseMessage,
    };

    // Send notification via Redis to the student
    await notifyStudentRequestUpdate(student, teacher, request, payload.newStatus);
    
    console.log(`✅ Notification sent to student ${student.name} about request status: ${payload.newStatus}`);
  } catch (error) {
    console.error('Error handling lesson request status update:', error);
  }
}

/**
 * Stop the PostgreSQL listener
 */
async function stopPgListener() {
  if (pgClient && isListening) {
    try {
      await pgClient.query('UNLISTEN *');
      await pgClient.end();
      isListening = false;
      console.log('🔇 PostgreSQL listener stopped');
    } catch (error) {
      console.error('Error stopping PostgreSQL listener:', error);
    }
  }
}

module.exports = {
  initializePgListener,
  stopPgListener,
};
