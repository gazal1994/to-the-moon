const { Message } = require('./src/models');
const { v5: uuidv5 } = require('uuid');

// Same namespace as in messages.js
const CONVERSATION_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

/**
 * Generate a deterministic conversation ID from two user IDs
 */
function generateConversationId(userId1, userId2) {
  const sortedIds = [userId1, userId2].sort();
  const conversationKey = sortedIds.join(':');
  return uuidv5(conversationKey, CONVERSATION_NAMESPACE);
}

async function backfillConversationIds() {
  try {
    console.log('🔄 Starting conversation ID backfill...');

    // Get all messages without conversation_id
    const messages = await Message.findAll({
      where: {
        conversationId: null
      },
      attributes: ['id', 'senderId', 'receiverId']
    });

    console.log(`📊 Found ${messages.length} messages without conversation_id`);

    if (messages.length === 0) {
      console.log('✅ All messages already have conversation_id!');
      process.exit(0);
    }

    let updatedCount = 0;

    // Update each message with conversation ID
    for (const message of messages) {
      const conversationId = generateConversationId(
        message.senderId,
        message.receiverId
      );

      await message.update({ conversationId });
      updatedCount++;

      if (updatedCount % 10 === 0) {
        console.log(`✓ Updated ${updatedCount}/${messages.length} messages...`);
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} messages with conversation_id`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error backfilling conversation IDs:', error);
    process.exit(1);
  }
}

backfillConversationIds();
