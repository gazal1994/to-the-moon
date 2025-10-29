const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentProfile = sequelize.define('StudentProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  gradeLevel: {
    type: DataTypes.ENUM('primary', 'prep', 'secondary', 'university'),
    defaultValue: 'secondary',
    field: 'grade_level'
  },
  subjectsNeeded: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    field: 'subjects_needed'
  },
  learningMode: {
    type: DataTypes.ENUM('online', 'in_person', 'hybrid'),
    defaultValue: 'online',
    field: 'learning_mode'
  },
  availability: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'student_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] }
  ]
});

module.exports = StudentProfile;