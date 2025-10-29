const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
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
  lessonRequestId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'lesson_request_id',
    references: {
      model: 'lesson_requests',
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['teacher_id'] },
    { fields: ['student_id'] },
    { 
      fields: ['student_id', 'teacher_id'],
      unique: true
    }
  ]
});

module.exports = Review;