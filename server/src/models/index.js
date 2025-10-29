const User = require('./user');
const TeacherProfile = require('./teacherProfile');
const StudentProfile = require('./studentProfile');
const LessonRequest = require('./LessonRequest');
const { Message, Conversation } = require('./Message');
const Review = require('./Review');
const Post = require('./post');
const Comment = require('./comment');
const TeacherAvailability = require('./TeacherAvailability');

// Define associations
User.hasOne(TeacherProfile, { foreignKey: 'userId', as: 'teacherProfile' });
TeacherProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(StudentProfile, { foreignKey: 'userId', as: 'studentProfile' });
StudentProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(LessonRequest, { foreignKey: 'studentId', as: 'studentRequests' });
User.hasMany(LessonRequest, { foreignKey: 'teacherId', as: 'teacherRequests' });
LessonRequest.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
LessonRequest.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// Teacher Availability associations
User.hasMany(TeacherAvailability, { foreignKey: 'teacherId', as: 'availability' });
TeacherAvailability.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
TeacherAvailability.belongsTo(User, { foreignKey: 'reservedBy', as: 'student' });
LessonRequest.hasOne(TeacherAvailability, { foreignKey: 'lessonRequestId', as: 'reservedSlot' });
TeacherAvailability.belongsTo(LessonRequest, { foreignKey: 'lessonRequestId', as: 'lessonRequest' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

User.hasMany(Review, { foreignKey: 'studentId', as: 'givenReviews' });
User.hasMany(Review, { foreignKey: 'teacherId', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Review.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
Review.belongsTo(LessonRequest, { foreignKey: 'lessonRequestId', as: 'lessonRequest' });

// Post associations
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Comment associations
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  User,
  TeacherProfile,
  StudentProfile,
  LessonRequest,
  Message,
  Conversation,
  Review,
  Post,
  Comment,
  TeacherAvailability
};