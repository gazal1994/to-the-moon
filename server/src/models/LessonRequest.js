const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LessonRequest = sequelize.define('LessonRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'student_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'teacher_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  preferredMode: {
    type: DataTypes.ENUM('online', 'in_person'),
    allowNull: false,
    field: 'preferred_mode'
  },
  preferredTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'preferred_time'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'canceled', 'completed'),
    defaultValue: 'pending'
  },
  responseMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'response_message'
  }
}, {
  tableName: 'lesson_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['student_id'] },
    { fields: ['teacher_id'] },
    { fields: ['status'] }
  ]
});

module.exports = LessonRequest;