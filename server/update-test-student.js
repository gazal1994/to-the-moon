const { User } = require('./src/models');

async function updateTestStudent() {
  try {
    const student = await User.findOne({
      where: { email: 'student@test.com' }
    });

    if (student) {
      await student.update({ name: 'John Smith' });
      console.log('✅ Updated student name to "John Smith"');
      console.log('   Email: student@test.com');
    } else {
      console.log('❌ Student not found with email: student@test.com');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating student:', error);
    process.exit(1);
  }
}

updateTestStudent();
