module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create teacher_availability table
    await queryInterface.createTable('teacher_availability', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      teacher_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      day_of_week: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Monday, Tuesday, Wednesday, etc.'
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
        comment: 'Start time in HH:MM:SS format'
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
        comment: 'End time in HH:MM:SS format'
      },
      is_reserved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'True if this slot has been reserved/booked'
      },
      reserved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Student ID who reserved this slot'
      },
      lesson_request_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'lesson_requests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Reference to the lesson request that reserved this slot'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'False if teacher removed this availability'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('teacher_availability', ['teacher_id']);
    await queryInterface.addIndex('teacher_availability', ['teacher_id', 'day_of_week']);
    await queryInterface.addIndex('teacher_availability', ['teacher_id', 'is_reserved']);
    await queryInterface.addIndex('teacher_availability', ['is_reserved', 'is_active']);

    // Migrate existing availability data from teacher_profiles
    // This query will parse the JSON availability and insert into new table
    await queryInterface.sequelize.query(`
      INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, is_reserved, is_active, created_at, updated_at)
      SELECT 
        tp.user_id as teacher_id,
        avail_item->>'day' as day_of_week,
        (avail_item->>'time')::text as start_time,
        (avail_item->>'time')::text as end_time,
        false as is_reserved,
        true as is_active,
        CURRENT_TIMESTAMP as created_at,
        CURRENT_TIMESTAMP as updated_at
      FROM teacher_profiles tp,
      jsonb_array_elements(tp.availability::jsonb) as avail_item
      WHERE tp.availability IS NOT NULL 
        AND tp.availability != 'null'
        AND jsonb_array_length(tp.availability::jsonb) > 0
    `).catch(err => {
      console.log('Note: Could not migrate existing availability data. This is OK if availability column does not exist yet.');
    });

    console.log('✅ Created teacher_availability table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('teacher_availability');
    console.log('✅ Dropped teacher_availability table');
  }
};
