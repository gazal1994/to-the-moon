const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const TeacherProfile = require('./src/models/TeacherProfile');
const StudentProfile = require('./src/models/StudentProfile');
const LessonRequest = require('./src/models/LessonRequest');
const Review = require('./src/models/Review');
const Message = require('./src/models/Message');
const Post = require('./src/models/post');
const Comment = require('./src/models/comment');

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ force: false }); // Use force: true to reset database
    console.log('✅ All models synced successfully');

    // Create default admin user if needed
    const adminExists = await User.findOne({ where: { email: 'admin@aqra.com' } });
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await User.create({
        name: 'Admin User',
        email: 'admin@aqra.com',
        passwordHash: hashedPassword,
        role: 'teacher',
        emailVerified: true,
        isActive: true
      });
      console.log('✅ Default admin user created (admin@aqra.com / admin123)');
    }

    console.log('🎉 Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
