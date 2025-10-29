const bcrypt = require('bcryptjs');
const { User, TeacherProfile, StudentProfile } = require('./src/models');
const { sequelize } = require('./src/config/database');

const dummyTeachers = [
  {
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@aqra.com',
    password: '123456',
    phone: '+20 100 123 4567',
    gender: 'male',
    languages: ['ar', 'en'],
    bio: 'Experienced Arabic and Quran teacher with 10 years of teaching experience. Specialized in tajweed and tafseer.',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    profile: {
      subjects: ['Arabic', 'Quran', 'Islamic Studies'],
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      yearsOfExperience: 10,
      certifications: ['Ijazah in Quran Recitation', 'Arabic Language Certificate'],
      hourlyRate: 50,
      isVolunteer: false,
      learningMode: 'hybrid',
      ratingAvg: 4.8,
      ratingCount: 45
    }
  },
  {
    name: 'Fatima Al-Sayed',
    email: 'fatima.alsayed@aqra.com',
    password: '123456',
    phone: '+20 101 234 5678',
    gender: 'female',
    languages: ['ar', 'en', 'fr'],
    bio: 'Passionate about teaching Arabic to non-native speakers. Certified Arabic teacher with modern teaching methods.',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    profile: {
      subjects: ['Arabic', 'Islamic Studies'],
      levels: ['Beginner', 'Intermediate'],
      yearsOfExperience: 7,
      certifications: ['Teaching Arabic as a Foreign Language'],
      hourlyRate: 40,
      isVolunteer: false,
      learningMode: 'online',
      ratingAvg: 4.9,
      ratingCount: 67
    }
  },
  {
    name: 'Muhammad Ali',
    email: 'muhammad.ali@aqra.com',
    password: '123456',
    phone: '+20 102 345 6789',
    gender: 'male',
    languages: ['ar', 'en'],
    bio: 'Volunteer Quran teacher dedicated to spreading Islamic knowledge. Available for free online classes.',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    profile: {
      subjects: ['Quran', 'Islamic Studies', 'Tajweed'],
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      yearsOfExperience: 5,
      certifications: ['Ijazah in Quran', 'Islamic Studies Degree'],
      hourlyRate: 0,
      isVolunteer: true,
      learningMode: 'online',
      ratingAvg: 5.0,
      ratingCount: 89
    }
  },
  {
    name: 'Sara Ibrahim',
    email: 'sara.ibrahim@aqra.com',
    password: '123456',
    phone: '+20 103 456 7890',
    gender: 'female',
    languages: ['ar', 'en'],
    bio: 'Expert in Quran memorization and tajweed. Specialized in teaching children and beginners.',
    avatarUrl: 'https://i.pravatar.cc/150?img=45',
    profile: {
      subjects: ['Quran', 'Tajweed', 'Arabic'],
      levels: ['Beginner', 'Intermediate'],
      yearsOfExperience: 8,
      certifications: ['Quran Memorization Certificate', 'Tajweed Expert'],
      hourlyRate: 35,
      isVolunteer: false,
      learningMode: 'online',
      ratingAvg: 4.7,
      ratingCount: 52
    }
  },
  {
    name: 'Omar Khalid',
    email: 'omar.khalid@aqra.com',
    password: '123456',
    phone: '+20 104 567 8901',
    gender: 'male',
    languages: ['ar', 'en', 'de'],
    bio: 'Arabic language specialist focusing on Modern Standard Arabic and Egyptian dialect.',
    avatarUrl: 'https://i.pravatar.cc/150?img=51',
    profile: {
      subjects: ['Arabic', 'Egyptian Dialect'],
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      yearsOfExperience: 12,
      certifications: ['Arabic Linguistics Degree', 'TESOL Certificate'],
      hourlyRate: 60,
      isVolunteer: false,
      learningMode: 'hybrid',
      ratingAvg: 4.6,
      ratingCount: 38
    }
  },
  {
    name: 'Aisha Mohamed',
    email: 'aisha.mohamed@aqra.com',
    password: '123456',
    phone: '+20 105 678 9012',
    gender: 'female',
    languages: ['ar', 'en'],
    bio: 'Dedicated to teaching Islamic studies and Quran with a focus on understanding and application.',
    avatarUrl: 'https://i.pravatar.cc/150?img=48',
    profile: {
      subjects: ['Islamic Studies', 'Quran', 'Hadith'],
      levels: ['Intermediate', 'Advanced'],
      yearsOfExperience: 9,
      certifications: ['Islamic Studies Degree', 'Quran Teacher Certificate'],
      hourlyRate: 45,
      isVolunteer: false,
      learningMode: 'online',
      ratingAvg: 4.9,
      ratingCount: 71
    }
  },
  {
    name: 'Youssef Ahmed',
    email: 'youssef.ahmed@aqra.com',
    password: '123456',
    phone: '+20 106 789 0123',
    gender: 'male',
    languages: ['ar'],
    bio: 'Young and enthusiastic Arabic teacher volunteering to help students worldwide.',
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
    profile: {
      subjects: ['Arabic', 'Quran'],
      levels: ['Beginner'],
      yearsOfExperience: 3,
      certifications: ['Arabic Teaching Certificate'],
      hourlyRate: 0,
      isVolunteer: true,
      learningMode: 'online',
      ratingAvg: 4.5,
      ratingCount: 24
    }
  },
  {
    name: 'Layla Hassan',
    email: 'layla.hassan@aqra.com',
    password: '123456',
    phone: '+20 107 890 1234',
    gender: 'female',
    languages: ['ar', 'en', 'es'],
    bio: 'Multilingual Arabic teacher with experience teaching international students.',
    avatarUrl: 'https://i.pravatar.cc/150?img=44',
    profile: {
      subjects: ['Arabic', 'Islamic Studies'],
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      yearsOfExperience: 11,
      certifications: ['Arabic Language Certificate', 'International Teaching Diploma'],
      hourlyRate: 55,
      isVolunteer: false,
      learningMode: 'hybrid',
      ratingAvg: 4.8,
      ratingCount: 63
    }
  }
];

const dummyStudents = [
  {
    name: 'John Smith',
    email: 'john.smith@student.com',
    password: '123456',
    phone: '+1 555 123 4567',
    gender: 'male',
    languages: ['en'],
    bio: 'Beginner student interested in learning Arabic and Quran.',
    avatarUrl: 'https://i.pravatar.cc/150?img=8',
    profile: {
      gradeLevel: 'secondary',
      subjectsNeeded: ['Arabic', 'Quran'],
      learningMode: 'online'
    }
  },
  {
    name: 'Emily Johnson',
    email: 'emily.johnson@student.com',
    password: '123456',
    phone: '+1 555 234 5678',
    gender: 'female',
    languages: ['en'],
    bio: 'Studying Arabic for university requirements.',
    avatarUrl: 'https://i.pravatar.cc/150?img=10',
    profile: {
      gradeLevel: 'university',
      subjectsNeeded: ['Arabic'],
      learningMode: 'online'
    }
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@student.com',
    password: '123456',
    phone: '+1 555 345 6789',
    gender: 'male',
    languages: ['en'],
    bio: 'Convert to Islam seeking to learn Quran and Islamic studies.',
    avatarUrl: 'https://i.pravatar.cc/150?img=13',
    profile: {
      gradeLevel: 'secondary',
      subjectsNeeded: ['Quran', 'Islamic Studies'],
      learningMode: 'online'
    }
  },
  {
    name: 'Sarah Davis',
    email: 'sarah.davis@student.com',
    password: '123456',
    phone: '+1 555 456 7890',
    gender: 'female',
    languages: ['en', 'fr'],
    bio: 'Intermediate student looking to improve Arabic speaking skills.',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    profile: {
      gradeLevel: 'university',
      subjectsNeeded: ['Arabic'],
      learningMode: 'online'
    }
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@student.com',
    password: '123456',
    phone: '+1 555 567 8901',
    gender: 'male',
    languages: ['en'],
    bio: 'Learning Arabic for business purposes.',
    avatarUrl: 'https://i.pravatar.cc/150?img=14',
    profile: {
      gradeLevel: 'university',
      subjectsNeeded: ['Arabic'],
      learningMode: 'hybrid'
    }
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@student.com',
    password: '123456',
    phone: '+1 555 678 9012',
    gender: 'female',
    languages: ['en'],
    bio: 'Young mother interested in learning Quran to teach her children.',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    profile: {
      gradeLevel: 'secondary',
      subjectsNeeded: ['Quran', 'Islamic Studies'],
      learningMode: 'online'
    }
  }
];

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('\n🔄 Creating teachers...');
    for (const teacherData of dummyTeachers) {
      const hashedPassword = await bcrypt.hash(teacherData.password, 10);
      
      const teacher = await User.create({
        name: teacherData.name,
        email: teacherData.email,
        passwordHash: hashedPassword,
        role: 'teacher',
        phone: teacherData.phone,
        gender: teacherData.gender,
        languages: teacherData.languages,
        bio: teacherData.bio,
        avatarUrl: teacherData.avatarUrl,
        emailVerified: true,
        isActive: true
      });

      await TeacherProfile.create({
        userId: teacher.id,
        subjects: teacherData.profile.subjects,
        levels: teacherData.profile.levels,
        yearsOfExperience: teacherData.profile.yearsOfExperience,
        certifications: teacherData.profile.certifications,
        hourlyRate: teacherData.profile.hourlyRate,
        isVolunteer: teacherData.profile.isVolunteer,
        learningMode: teacherData.profile.learningMode,
        ratingAvg: teacherData.profile.ratingAvg,
        ratingCount: teacherData.profile.ratingCount
      });

      console.log(`  ✅ Created teacher: ${teacherData.name}`);
    }

    console.log('\n🔄 Creating students...');
    for (const studentData of dummyStudents) {
      const hashedPassword = await bcrypt.hash(studentData.password, 10);
      
      const student = await User.create({
        name: studentData.name,
        email: studentData.email,
        passwordHash: hashedPassword,
        role: 'student',
        phone: studentData.phone,
        gender: studentData.gender,
        languages: studentData.languages,
        bio: studentData.bio,
        avatarUrl: studentData.avatarUrl,
        emailVerified: true,
        isActive: true
      });

      await StudentProfile.create({
        userId: student.id,
        gradeLevel: studentData.profile.gradeLevel,
        subjectsNeeded: studentData.profile.subjectsNeeded,
        learningMode: studentData.profile.learningMode
      });

      console.log(`  ✅ Created student: ${studentData.name}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`   📊 Created ${dummyTeachers.length} teachers`);
    console.log(`   📊 Created ${dummyStudents.length} students`);
    console.log('\n📝 All users have password: 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
