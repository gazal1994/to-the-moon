const { sequelize } = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...\n');

    // Get all migration files
    const migrationsPath = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files:\n`);
    migrationFiles.forEach(file => console.log(`  - ${file}`));
    console.log('');

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`\n📝 Running migration: ${file}`);
      const migration = require(path.join(migrationsPath, file));
      
      try {
        await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
        console.log(`✅ Completed: ${file}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Skipped: ${file} (already applied)`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
