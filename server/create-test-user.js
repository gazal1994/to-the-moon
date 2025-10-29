const bcrypt = require('bcryptjs');
const { User, TeacherProfile, StudentProfile } = require('./src/models');

async function createTestUser() {
  try {
    // Create a test student
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const student = await User.create({
      name: 'John Smith',
      email: 'student@test.com',
      passwordHash: hashedPassword,
      role: 'student',
      phone: '1234567890',
      emailVerified: true,
      phoneVerified: true,
      avatarUrl: null,
      gender: 'male',
      languages: ['en'],
      bio: 'Test student account',
      isActive: true
    });

    await StudentProfile.create({
      userId: student.id,
      gradeLevel: 'secondary',
      subjectsNeeded: ['Math', 'Science'],
      learningMode: 'online',
      availability: []
    });

    console.log('✅ Test student created:');
    console.log('   Email: student@test.com');
    console.log('   Password: 123456');

    // Create a test teacher
    const teacher = await User.create({
      name: 'Test Teacher',
      email: 'teacher@test.com',
      passwordHash: hashedPassword,
      role: 'teacher',
      phone: '0987654321',
      emailVerified: true,
      phoneVerified: true,
      avatarUrl: null,
      gender: 'female',
      languages: ['en', 'ar'],
      bio: 'Experienced teacher',
      isActive: true
    });

    await TeacherProfile.create({
      userId: teacher.id,
      subjects: ['Math', 'Physics'],
      levels: ['secondary', 'university'],
      yearsOfExperience: 5,
      certifications: ['PhD in Mathematics'],
      hourlyRate: 50,
      isVolunteer: false,
      maxStudentsPerSession: 3,
      learningMode: 'online',
      availability: [],
      ratingAvg: 4.5,
      ratingCount: 10
    });

    console.log('✅ Test teacher created:');
    console.log('   Email: teacher@test.com');
    console.log('   Password: 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUser();
