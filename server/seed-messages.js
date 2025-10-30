const { User, Message } = require('./src/models');
const bcrypt = require('bcryptjs');

async function seedMessagingData() {
  try {
    console.log('🌱 Seeding messaging data...');

    // Find or create sample users (teachers and students)
    const hashedPassword = await bcrypt.hash('password123', 10);

    const userEmails = [
      { name: 'Sarah Mohamed', email: 'sarah@aqra.com', role: 'teacher' },
      { name: 'Ahmed Ali', email: 'ahmed@aqra.com', role: 'teacher' },
      { name: 'Fatima Hassan', email: 'fatima@aqra.com', role: 'student' },
      { name: 'Omar Ibrahim', email: 'omar@aqra.com', role: 'student' }
    ];

    const users = [];
    for (const userData of userEmails) {
      const [user] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          ...userData,
          passwordHash: hashedPassword,
          emailVerified: true,
          isActive: true
        }
      });
      users.push(user);
    }

    console.log(`✅ Found/Created ${users.length} users`);

    // Get the first user (will be our logged-in user)
    const currentUserId = users[0].id;

    // Create sample messages
    const messages = [];

    // Conversation 1: Current user with Ahmed Ali (teacher)
    messages.push(
      {
        senderId: users[1].id, // Ahmed
        receiverId: currentUserId,
        content: 'Hi! I saw you\'re interested in learning Physics. I have 10+ years of experience.',
        messageType: 'text',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        senderId: currentUserId,
        receiverId: users[1].id,
        content: 'Hello Ahmed! Yes, I need help with Physics. What are your available times?',
        messageType: 'text',
        isRead: true,
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
      },
      {
        senderId: users[1].id,
        receiverId: currentUserId,
        content: 'I\'m available on weekdays from 4 PM to 8 PM. Would that work for you?',
        messageType: 'text',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    );

    // Conversation 2: Current user with Fatima Hassan (student)
    messages.push(
      {
        senderId: currentUserId,
        receiverId: users[2].id,
        content: 'Hi Fatima! Are you also preparing for the final exams?',
        messageType: 'text',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        senderId: users[2].id,
        receiverId: currentUserId,
        content: 'Yes! Would you like to study together?',
        messageType: 'text',
        isRead: true,
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000)
      },
      {
        senderId: users[2].id,
        receiverId: currentUserId,
        content: 'I\'m struggling with Chemistry. Maybe we can help each other?',
        messageType: 'text',
        isRead: false,
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000)
      }
    );

    // Conversation 3: Current user with Omar Ibrahim (student)
    messages.push(
      {
        senderId: users[3].id,
        receiverId: currentUserId,
        content: 'Hey! Did you understand today\'s Math lesson?',
        messageType: 'text',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        senderId: currentUserId,
        receiverId: users[3].id,
        content: 'Yes, which part are you confused about?',
        messageType: 'text',
        isRead: true,
        createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000)
      }
    );

    await Message.bulkCreate(messages);
    console.log(`✅ Created ${messages.length} messages`);

    console.log('\n🎉 Messaging data seeded successfully!');
    console.log('\n📝 Test credentials:');
    console.log('Email: sarah@aqra.com');
    console.log('Password: password123');
    console.log(`User ID: ${currentUserId}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding messaging data:', error);
    process.exit(1);
  }
}

seedMessagingData();
