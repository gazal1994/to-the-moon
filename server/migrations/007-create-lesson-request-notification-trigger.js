/**
 * Migration: Create trigger for lesson request notifications
 * 
 * This migration creates a PostgreSQL trigger that automatically sends notifications
 * when a new lesson request is inserted into the lesson_requests table.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Creating lesson request notification trigger...');

      // Create a function that will be called by the trigger
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION notify_new_lesson_request()
        RETURNS TRIGGER AS $$
        DECLARE
          teacher_record RECORD;
          student_record RECORD;
        BEGIN
          -- Get teacher and student details
          SELECT id, name, email, avatar_url INTO teacher_record
          FROM users WHERE id = NEW.teacher_id;
          
          SELECT id, name, email, avatar_url INTO student_record
          FROM users WHERE id = NEW.student_id;
          
          -- Send notification via NOTIFY (can be listened to by Node.js)
          PERFORM pg_notify(
            'lesson_request_created',
            json_build_object(
              'requestId', NEW.id,
              'teacherId', teacher_record.id,
              'teacherName', teacher_record.name,
              'teacherEmail', teacher_record.email,
              'teacherAvatar', teacher_record.avatar_url,
              'studentId', student_record.id,
              'studentName', student_record.name,
              'studentEmail', student_record.email,
              'studentAvatar', student_record.avatar_url,
              'subject', NEW.subject,
              'message', NEW.message,
              'preferredTime', NEW.preferred_time,
              'preferredMode', NEW.preferred_mode,
              'status', NEW.status,
              'createdAt', NEW.created_at
            )::text
          );
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `, { transaction });

      console.log('✅ Created notify_new_lesson_request function');

      // Create the trigger
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS lesson_request_created_trigger ON lesson_requests;
        
        CREATE TRIGGER lesson_request_created_trigger
        AFTER INSERT ON lesson_requests
        FOR EACH ROW
        EXECUTE FUNCTION notify_new_lesson_request();
      `, { transaction });

      console.log('✅ Created lesson_request_created_trigger');

      // Create a function for status updates
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION notify_lesson_request_status_update()
        RETURNS TRIGGER AS $$
        DECLARE
          teacher_record RECORD;
          student_record RECORD;
        BEGIN
          -- Only notify if status actually changed
          IF OLD.status IS DISTINCT FROM NEW.status THEN
            -- Get teacher and student details
            SELECT id, name, email, avatar_url INTO teacher_record
            FROM users WHERE id = NEW.teacher_id;
            
            SELECT id, name, email, avatar_url INTO student_record
            FROM users WHERE id = NEW.student_id;
            
            -- Send notification via NOTIFY
            PERFORM pg_notify(
              'lesson_request_status_updated',
              json_build_object(
                'requestId', NEW.id,
                'teacherId', teacher_record.id,
                'teacherName', teacher_record.name,
                'teacherEmail', teacher_record.email,
                'teacherAvatar', teacher_record.avatar_url,
                'studentId', student_record.id,
                'studentName', student_record.name,
                'studentEmail', student_record.email,
                'studentAvatar', student_record.avatar_url,
                'subject', NEW.subject,
                'oldStatus', OLD.status,
                'newStatus', NEW.status,
                'responseMessage', NEW.response_message,
                'updatedAt', NEW.updated_at
              )::text
            );
          END IF;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `, { transaction });

      console.log('✅ Created notify_lesson_request_status_update function');

      // Create the status update trigger
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS lesson_request_status_updated_trigger ON lesson_requests;
        
        CREATE TRIGGER lesson_request_status_updated_trigger
        AFTER UPDATE ON lesson_requests
        FOR EACH ROW
        EXECUTE FUNCTION notify_lesson_request_status_update();
      `, { transaction });

      console.log('✅ Created lesson_request_status_updated_trigger');

      await transaction.commit();
      console.log('✅ Lesson request notification triggers created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error creating notification triggers:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Removing lesson request notification triggers...');

      // Drop triggers
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS lesson_request_created_trigger ON lesson_requests;
        DROP TRIGGER IF EXISTS lesson_request_status_updated_trigger ON lesson_requests;
      `, { transaction });

      console.log('✅ Dropped triggers');

      // Drop functions
      await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS notify_new_lesson_request();
        DROP FUNCTION IF EXISTS notify_lesson_request_status_update();
      `, { transaction });

      console.log('✅ Dropped functions');

      await transaction.commit();
      console.log('✅ Lesson request notification triggers removed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error removing notification triggers:', error);
      throw error;
    }
  }
};
