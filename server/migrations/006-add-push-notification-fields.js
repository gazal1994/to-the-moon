/**
 * Migration: Add push notification fields
 * 
 * This migration adds:
 * 1. push_provider column to users table (for Firebase/FCM)
 * 2. notified column to lesson_requests table (tracking if notification sent)
 * 3. Updates status enum in lesson_requests to include 'NEW' status
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add push_provider to users table
      await queryInterface.addColumn('users', 'push_provider', {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'fcm',
        comment: 'Push notification provider (fcm, apns, etc.)',
        transaction
      });
      
      console.log('✅ Added push_provider column to users table');

      // Add notified column to lesson_requests table
      await queryInterface.addColumn('lesson_requests', 'notified', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether push notification has been sent for this request',
        transaction
      });
      
      console.log('✅ Added notified column to lesson_requests table');

      // Update existing records to set notified = true (already processed)
      await queryInterface.sequelize.query(
        "UPDATE lesson_requests SET notified = true WHERE status != 'pending'",
        { transaction }
      );

      // Add index for efficient polling query
      await queryInterface.addIndex('lesson_requests', ['status', 'notified'], {
        name: 'idx_lesson_requests_status_notified',
        transaction
      });

      console.log('✅ Added index on lesson_requests(status, notified)');

      await transaction.commit();
      console.log('✅ Migration 006-add-push-notification-fields completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove index
      await queryInterface.removeIndex('lesson_requests', 'idx_lesson_requests_status_notified', {
        transaction
      });

      // Remove columns
      await queryInterface.removeColumn('lesson_requests', 'notified', { transaction });
      await queryInterface.removeColumn('users', 'push_provider', { transaction });

      await transaction.commit();
      console.log('✅ Migration 006-add-push-notification-fields rolled back successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
