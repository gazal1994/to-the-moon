const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherProfile = sequelize.define('TeacherProfile', {
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
  subjects: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  levels: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'years_of_experience'
  },
  certifications: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'hourly_rate'
  },
  isVolunteer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_volunteer'
  },
  maxStudentsPerSession: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'max_students_per_session'
  },
  learningMode: {
    type: DataTypes.ENUM('online', 'in_person', 'hybrid'),
    defaultValue: 'online',
    field: 'learning_mode'
  },
  ratingAvg: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.0,
    field: 'rating_avg'
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'rating_count'
  }
}, {
  tableName: 'teacher_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] }
  ]
});

module.exports = TeacherProfile;