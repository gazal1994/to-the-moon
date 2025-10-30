const { sequelize } = require('./src/config/database');

async function alterTable() {
  try {
    console.log('🔧 Altering messages table...');

    await sequelize.query(
      'ALTER TABLE messages ALTER COLUMN conversation_id DROP NOT NULL;'
    );

    console.log('✅ Successfully made conversation_id nullable');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error altering table:', error);
    process.exit(1);
  }
}

alterTable();
