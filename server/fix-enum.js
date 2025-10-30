const { sequelize } = require('./src/config/database');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Rename 'canceled' to 'cancelled'
    await sequelize.query(`ALTER TYPE enum_lesson_requests_status RENAME VALUE 'canceled' TO 'cancelled';`);
    console.log('✅ Renamed canceled to cancelled in enum_lesson_requests_status');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
