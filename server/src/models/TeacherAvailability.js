const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherAvailability = sequelize.define('TeacherAvailability', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'teacher_id'
  },
  dayOfWeek: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'day_of_week',
    validate: {
      isIn: [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']]
    }
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'end_time'
  },
  isReserved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_reserved'
  },
  reservedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'reserved_by'
  },
  lessonRequestId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'lesson_request_id'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at'
  }
}, {
  tableName: 'teacher_availability',
  timestamps: true,
  underscored: true
});

module.exports = TeacherAvailability;
