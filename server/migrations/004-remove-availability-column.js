module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if availability column exists before removing
    const tableDescription = await queryInterface.describeTable('teacher_profiles');
    if (tableDescription.availability) {
      await queryInterface.removeColumn('teacher_profiles', 'availability');
      console.log('✅ Removed availability column from teacher_profiles');
    } else {
      console.log('⏭️  Column availability already removed from teacher_profiles');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Restore availability column if needed
    await queryInterface.addColumn('teacher_profiles', 'availability', {
      type: Sequelize.JSONB,
      allowNull: true
    });
    console.log('✅ Restored availability column to teacher_profiles');
  }
};
