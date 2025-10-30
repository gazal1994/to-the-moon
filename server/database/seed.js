require('dotenv').config();
const bcrypt = require('bcryptjs');
const { testConnection, syncDatabase } = require('../src/config/database');
const {
  User,
  TeacherProfile,
  StudentProfile,
  LessonRequest,
  Message,
  Conversation,
  Review
} = require('../src/models');

const mockData = {
  teachers: [
    {
      name: 'Dr. Ahmed Hassan',
      email: 'ahmed.hassan@email.com',
      password: 'password123',
      phone: '+201234567890',
      languages: ['ar', 'en'],
      bio: 'Experienced mathematics teacher with 10+ years of experience',
      profile: {
        subjects: ['Mathematics', 'Physics', 'Statistics'],
        levels: ['secondary', 'university'],
        yearsOfExperience: 12,
        certifications: ['PhD in Mathematics', 'Teaching Certification'],
        hourlyRate: 50.00,
        isVolunteer: false,
        maxStudentsPerSession: 3,
        learningMode: 'hybrid',
        availability: [
          { day: 'monday', times: ['09:00-12:00', '14:00-17:00'] },
          { day: 'wednesday', times: ['09:00-12:00', '14:00-17:00'] },
          { day: 'friday', times: ['09:00-12:00'] }
        ]
      }
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      password: 'password123',
      phone: '+441234567890',
      languages: ['en'],
      bio: 'Native English speaker specializing in language learning',
      profile: {
        subjects: ['English', 'Literature', 'Writing'],
        levels: ['primary', 'prep', 'secondary'],
        yearsOfExperience: 8,
        certifications: ['TESOL Certified', 'Masters in English Literature'],
        hourlyRate: 35.00,
        isVolunteer: false,
        maxStudentsPerSession: 2,
        learningMode: 'online',
        availability: [
          { day: 'tuesday', times: ['10:00-13:00', '15:00-18:00'] },
          { day: 'thursday', times: ['10:00-13:00', '15:00-18:00'] },
          { day: 'saturday', times: ['09:00-14:00'] }
        ]
      }
    },
    {
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      password: 'password123',
      phone: '+34612345678',
      languages: ['es', 'en'],
      bio: 'Passionate science teacher making learning fun and interactive',
      profile: {
        subjects: ['Biology', 'Chemistry', 'Environmental Science'],
        levels: ['prep', 'secondary'],
        yearsOfExperience: 6,
        certifications: ['MSc in Biology', 'Science Education Certificate'],
        hourlyRate: 40.00,
        isVolunteer: false,
        maxStudentsPerSession: 4,
        learningMode: 'in_person',
        availability: [
          { day: 'monday', times: ['14:00-18:00'] },
          { day: 'wednesday', times: ['14:00-18:00'] },
          { day: 'friday', times: ['14:00-18:00'] }
        ]
      }
    },
    {
      name: 'Omar Al-Rashid',
      email: 'omar.alrashid@email.com',
      password: 'password123',
      phone: '+971501234567',
      languages: ['ar', 'en', 'fr'],
      bio: 'Computer science expert with industry and teaching experience',
      profile: {
        subjects: ['Computer Science', 'Programming', 'Web Development'],
        levels: ['secondary', 'university'],
        yearsOfExperience: 15,
        certifications: ['MSc Computer Science', 'AWS Certified', 'Google Developer'],
        hourlyRate: 60.00,
        isVolunteer: false,
        maxStudentsPerSession: 2,
        learningMode: 'online',
        availability: [
          { day: 'sunday', times: ['18:00-22:00'] },
          { day: 'tuesday', times: ['18:00-22:00'] },
          { day: 'thursday', times: ['18:00-22:00'] }
        ]
      }
    },
    {
      name: 'Lisa Chen',
      email: 'lisa.chen@email.com',
      password: 'password123',
      phone: '+8613812345678',
      languages: ['zh', 'en'],
      bio: 'Volunteer teacher passionate about helping students succeed',
      profile: {
        subjects: ['Mathematics', 'Chinese', 'History'],
        levels: ['primary', 'prep'],
        yearsOfExperience: 4,
        certifications: ['Teaching Certificate', 'Mandarin Proficiency'],
        hourlyRate: 0.00,
        isVolunteer: true,
        maxStudentsPerSession: 5,
        learningMode: 'hybrid',
        availability: [
          { day: 'saturday', times: ['09:00-12:00', '14:00-17:00'] },
          { day: 'sunday', times: ['09:00-12:00', '14:00-17:00'] }
        ]
      }
    }
  ],
  students: [
    {
      name: 'Yasmin Mohamed',
      email: 'yasmin.mohamed@email.com',
      password: 'password123',
      phone: '+201987654321',
      languages: ['ar', 'en'],
      bio: 'High school student preparing for university entrance exams',
      profile: {
        gradeLevel: 'secondary',
        subjectsNeeded: ['Mathematics', 'Physics', 'Chemistry'],
        learningMode: 'hybrid',
        availability: [
          { day: 'monday', times: ['16:00-19:00'] },
          { day: 'wednesday', times: ['16:00-19:00'] },
          { day: 'saturday', times: ['10:00-15:00'] }
        ]
      }
    },
    {
      name: 'John Smith',
      email: 'john.smith@email.com',
      password: 'password123',
      phone: '+1234567890',
      languages: ['en'],
      bio: 'University student needing help with advanced topics',
      profile: {
        gradeLevel: 'university',
        subjectsNeeded: ['Computer Science', 'Statistics', 'Mathematics'],
        learningMode: 'online',
        availability: [
          { day: 'tuesday', times: ['19:00-22:00'] },
          { day: 'thursday', times: ['19:00-22:00'] },
          { day: 'sunday', times: ['14:00-18:00'] }
        ]
      }
    },
    {
      name: 'Emma Wilson',
      email: 'emma.wilson@email.com',
      password: 'password123',
      phone: '+447123456789',
      languages: ['en'],
      bio: 'Primary school student wanting to improve in science',
      profile: {
        gradeLevel: 'primary',
        subjectsNeeded: ['Biology', 'Chemistry', 'Mathematics'],
        learningMode: 'in_person',
        availability: [
          { day: 'monday', times: ['15:00-17:00'] },
          { day: 'wednesday', times: ['15:00-17:00'] },
          { day: 'friday', times: ['15:00-17:00'] }
        ]
      }
    }
  ]
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Test connection
    await testConnection();
    
    // Sync database (recreate tables)
    await syncDatabase();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Review.destroy({ where: {} });
    await LessonRequest.destroy({ where: {} });
    await Message.destroy({ where: {} });
    await Conversation.destroy({ where: {} });
    await TeacherProfile.destroy({ where: {} });
    await StudentProfile.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create teachers
    console.log('👨‍🏫 Creating teachers...');
    const createdTeachers = [];
    for (const teacherData of mockData.teachers) {
      const hashedPassword = await bcrypt.hash(teacherData.password, 12);
      
      const teacher = await User.create({
        name: teacherData.name,
        email: teacherData.email,
        passwordHash: hashedPassword,
        role: 'teacher',
        phone: teacherData.phone,
        emailVerified: true,
        phoneVerified: true,
        languages: teacherData.languages,
        bio: teacherData.bio,
        isActive: true
      });

      await TeacherProfile.create({
        userId: teacher.id,
        ...teacherData.profile
      });

      createdTeachers.push(teacher);
      console.log(`   ✅ Created teacher: ${teacher.name}`);
    }

    // Create students
    console.log('👨‍🎓 Creating students...');
    const createdStudents = [];
    for (const studentData of mockData.students) {
      const hashedPassword = await bcrypt.hash(studentData.password, 12);
      
      const student = await User.create({
        name: studentData.name,
        email: studentData.email,
        passwordHash: hashedPassword,
        role: 'student',
        phone: studentData.phone,
        emailVerified: true,
        phoneVerified: true,
        languages: studentData.languages,
        bio: studentData.bio,
        isActive: true
      });

      await StudentProfile.create({
        userId: student.id,
        ...studentData.profile
      });

      createdStudents.push(student);
      console.log(`   ✅ Created student: ${student.name}`);
    }

    // Create some lesson requests
    console.log('📚 Creating lesson requests...');
    const requests = [
      {
        studentId: createdStudents[0].id,
        teacherId: createdTeachers[0].id,
        subject: 'Mathematics',
        preferredMode: 'online',
        preferredTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        message: 'I need help with calculus, especially derivatives and integrals.',
        status: 'pending'
      },
      {
        studentId: createdStudents[1].id,
        teacherId: createdTeachers[3].id,
        subject: 'Computer Science',
        preferredMode: 'online',
        preferredTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        message: 'Looking for help with data structures and algorithms.',
        status: 'accepted'
      },
      {
        studentId: createdStudents[2].id,
        teacherId: createdTeachers[2].id,
        subject: 'Biology',
        preferredMode: 'in_person',
        preferredTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        message: 'Need help understanding cell biology concepts.',
        status: 'pending'
      }
    ];

    for (const requestData of requests) {
      const request = await LessonRequest.create(requestData);
      console.log(`   ✅ Created lesson request: ${request.subject}`);
    }

    // Create some reviews
    console.log('⭐ Creating reviews...');
    const reviews = [
      {
        studentId: createdStudents[0].id,
        teacherId: createdTeachers[1].id,
        rating: 5,
        comment: 'Excellent teacher! Very patient and explains concepts clearly. Highly recommended!'
      },
      {
        studentId: createdStudents[1].id,
        teacherId: createdTeachers[0].id,
        rating: 4,
        comment: 'Great knowledge of mathematics. Helped me understand complex topics easily.'
      },
      {
        studentId: createdStudents[2].id,
        teacherId: createdTeachers[4].id,
        rating: 5,
        comment: 'Amazing volunteer teacher! Very dedicated and helpful. Thank you so much!'
      }
    ];

    for (const reviewData of reviews) {
      const review = await Review.create(reviewData);
      
      // Update teacher rating
      const teacher = await User.findByPk(reviewData.teacherId, {
        include: [{ model: TeacherProfile, as: 'teacherProfile' }]
      });
      
      if (teacher && teacher.teacherProfile) {
        const allReviews = await Review.findAll({
          where: { teacherId: reviewData.teacherId }
        });
        
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        
        await teacher.teacherProfile.update({
          ratingAvg: Math.round(avgRating * 10) / 10,
          ratingCount: allReviews.length
        });
      }
      
      console.log(`   ✅ Created review: ${review.rating} stars`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👨‍🏫 Teachers: ${createdTeachers.length}`);
    console.log(`   👨‍🎓 Students: ${createdStudents.length}`);
    console.log(`   📚 Lesson Requests: ${requests.length}`);
    console.log(`   ⭐ Reviews: ${reviews.length}`);
    
    console.log('\n📋 Test Accounts:');
    console.log('Teachers:');
    mockData.teachers.forEach(t => {
      console.log(`   📧 ${t.email} / 🔑 ${t.password}`);
    });
    console.log('Students:');
    mockData.students.forEach(s => {
      console.log(`   📧 ${s.email} / 🔑 ${s.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();