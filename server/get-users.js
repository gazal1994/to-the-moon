const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');

async function getUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role']
    });
    
    console.log(JSON.stringify(users, null, 2));
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getUsers();
