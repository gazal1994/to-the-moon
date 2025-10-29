const { sequelize } = require('./src/config/database');
const { User, TeacherProfile } = require('./src/models');

async function checkAvailability() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Find Ahmed Hassan
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
      console.log('❌ Ahmed Hassan not found');
      process.exit(1);
    }

    console.log('\n📋 Ahmed Hassan Profile:');
    console.log('ID:', ahmed.id);
    console.log('Name:', ahmed.name);
    console.log('Email:', ahmed.email);
    
    if (ahmed.teacherProfile) {
      console.log('\n✅ Teacher Profile exists');
      console.log('Hourly Rate:', ahmed.teacherProfile.hourlyRate);
      console.log('Subjects:', ahmed.teacherProfile.subjects);
      console.log('Learning Mode:', ahmed.teacherProfile.learningMode);
      
      const availability = ahmed.teacherProfile.availability;
      console.log('\n📅 Availability Data:');
      console.log('Type:', typeof availability);
      console.log('Is Array:', Array.isArray(availability));
      console.log('Length:', availability ? availability.length : 0);
      
      if (availability && availability.length > 0) {
        console.log('\n✅ First 5 slots:');
        availability.slice(0, 5).forEach((slot, i) => {
          console.log(`  ${i + 1}. ${slot.day} - ${slot.time} (available: ${slot.available})`);
        });
        
        console.log('\nTotal slots:', availability.length);
        
        // Group by day
        const byDay = {};
        availability.forEach(slot => {
          if (!byDay[slot.day]) byDay[slot.day] = [];
          byDay[slot.day].push(slot.time);
        });
        
        console.log('\n📊 Slots per day:');
        Object.keys(byDay).forEach(day => {
          console.log(`  ${day}: ${byDay[day].length} slots`);
        });
      } else {
        console.log('❌ No availability data found');
      }
    } else {
      console.log('❌ No teacher profile found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAvailability();
