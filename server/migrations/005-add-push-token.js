'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'push_token', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'bio'
    });
    
    console.log('✅ Added push_token column to users table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'push_token');
    console.log('✅ Removed push_token column from users table');
  }
};
