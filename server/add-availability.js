const { sequelize } = require('./src/config/database');
const { User, TeacherProfile } = require('./src/models');

async function addAvailabilityForAhmedHassan() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Find Ahmed Hassan by name
    const ahmed = await User.findOne({
      where: {
        name: 'Ahmed Hassan',
        role: 'teacher'
      },
      include: [{
        model: TeacherProfile,
        as: 'teacherProfile'
      }]
    });

    if (!ahmed) {
      console.log('❌ Ahmed Hassan not found in database');
      console.log('Looking for all teachers...');
      
      const allTeachers = await User.findAll({
        where: { role: 'teacher' },
        attributes: ['id', 'name', 'email']
      });
      
      console.log('Found teachers:', allTeachers.map(t => ({ name: t.name, email: t.email })));
      process.exit(1);
    }

    console.log('✅ Found Ahmed Hassan:', {
      id: ahmed.id,
      name: ahmed.name,
      email: ahmed.email
    });

    // Create availability schedule
    const availability = [
      // Monday
      { day: 'Monday', time: '9:00 AM - 10:00 AM', available: true },
      { day: 'Monday', time: '10:00 AM - 11:00 AM', available: true },
      { day: 'Monday', time: '11:00 AM - 12:00 PM', available: true },
      { day: 'Monday', time: '2:00 PM - 3:00 PM', available: true },
      { day: 'Monday', time: '3:00 PM - 4:00 PM', available: true },
      { day: 'Monday', time: '4:00 PM - 5:00 PM', available: true },
      
      // Tuesday
      { day: 'Tuesday', time: '9:00 AM - 10:00 AM', available: true },
      { day: 'Tuesday', time: '10:00 AM - 11:00 AM', available: true },
      { day: 'Tuesday', time: '2:00 PM - 3:00 PM', available: true },
      { day: 'Tuesday', time: '3:00 PM - 4:00 PM', available: true },
      
      // Wednesday
      { day: 'Wednesday', time: '9:00 AM - 10:00 AM', available: true },
      { day: 'Wednesday', time: '10:00 AM - 11:00 AM', available: true },
      { day: 'Wednesday', time: '11:00 AM - 12:00 PM', available: true },
      { day: 'Wednesday', time: '1:00 PM - 2:00 PM', available: true },
      { day: 'Wednesday', time: '2:00 PM - 3:00 PM', available: true },
      { day: 'Wednesday', time: '3:00 PM - 4:00 PM', available: true },
      
      // Thursday
      { day: 'Thursday', time: '10:00 AM - 11:00 AM', available: true },
      { day: 'Thursday', time: '11:00 AM - 12:00 PM', available: true },
      { day: 'Thursday', time: '2:00 PM - 3:00 PM', available: true },
      { day: 'Thursday', time: '3:00 PM - 4:00 PM', available: true },
      { day: 'Thursday', time: '4:00 PM - 5:00 PM', available: true },
      
      // Friday
      { day: 'Friday', time: '9:00 AM - 10:00 AM', available: true },
      { day: 'Friday', time: '10:00 AM - 11:00 AM', available: true },
      { day: 'Friday', time: '11:00 AM - 12:00 PM', available: true },
      { day: 'Friday', time: '2:00 PM - 3:00 PM', available: true },
      
      // Saturday
      { day: 'Saturday', time: '10:00 AM - 11:00 AM', available: true },
      { day: 'Saturday', time: '11:00 AM - 12:00 PM', available: true },
      { day: 'Saturday', time: '12:00 PM - 1:00 PM', available: true },
      { day: 'Saturday', time: '2:00 PM - 3:00 PM', available: true },
      { day: 'Saturday', time: '3:00 PM - 4:00 PM', available: true },
    ];

    // Update teacher profile with availability
    if (ahmed.teacherProfile) {
      await ahmed.teacherProfile.update({
        availability: availability
      });
      console.log('✅ Updated existing teacher profile');
    } else {
      // Create teacher profile if it doesn't exist
      await TeacherProfile.create({
        userId: ahmed.id,
        availability: availability,
        subjects: ['Arabic', 'Islamic Studies'],
        hourlyRate: 50.00,
        yearsOfExperience: 5,
        learningMode: 'online'
      });
      console.log('✅ Created new teacher profile');
    }

    console.log(`✅ Successfully added ${availability.length} availability slots for Ahmed Hassan`);
    console.log('📅 Availability schedule:');
    
    // Group by day for display
    const groupedByDay = availability.reduce((acc, slot) => {
      if (!acc[slot.day]) acc[slot.day] = [];
      acc[slot.day].push(slot.time);
      return acc;
    }, {});
    
    Object.keys(groupedByDay).forEach(day => {
      console.log(`   ${day}: ${groupedByDay[day].join(', ')}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addAvailabilityForAhmedHassan();
